import fetchMock from '@fetch-mock/jest';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/subtestsCrossPlatformLoader';
import SubtestsCrossPlatformView from '../../components/CompareResults/SubtestsResults/CrossPlatform/SubtestsCrossPlatformView';
import { Strings } from '../../resources/Strings';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../types/state';
import { getSubtestsCompareWithBaseLink } from '../../utils/subtestsLinks';
import getTestData, { cloneSubtestsForPlatform } from '../utils/fixtures';
import { act, renderWithRouter, screen, within } from '../utils/test-utils';

const LINUX = 'linux1804-64-shippable-qr';
const WINDOWS = 'windows10-64-shippable-qr';

const BASE_SEARCH =
  '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central' +
  '&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1';

// The subtests fetch is memoized in a module-global map keyed on the request
// parameters, so each test uses its own signature numbers to make sure it
// really exercises its own mocked responses.
let nextSignature = 1000;
function nextSignaturePair() {
  nextSignature += 10;
  return { base: String(nextSignature), next: String(nextSignature + 1) };
}

type PlatformMock = {
  platform: string;
  results: CompareResultsItem[] | MannWhitneyResultsItem[] | number;
};

function setup(platforms: PlatformMock[], extraParameters = '') {
  let search = BASE_SEARCH;
  for (const { platform, results } of platforms) {
    const { base, next } = nextSignaturePair();
    fetchMock.get({
      url: 'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      query: { base_parent_signature: base },
      response: results,
    });
    search +=
      `&baseParentSignature=${base}&newParentSignature=${next}` +
      `&platform=${encodeURIComponent(platform)}`;
  }
  if (extraParameters) {
    search += '&' + extraParameters;
  }

  renderWithRouter(
    <SubtestsCrossPlatformView
      title={Strings.metaData.pageTitle.subtestsCrossPlatform}
    />,
    {
      route: '/subtests-cross-platform-results/',
      search,
      loader,
    },
  );
}

// Parses the matrix into `subtest: cell, cell, …` strings, so filtering and
// sorting can be asserted without leaning on snapshots.
function summarizeVisibleRows() {
  const rows = screen.getAllByRole('row');
  const result = [];
  for (const row of rows) {
    const subtest = row.querySelector('.subtests')?.textContent;
    if (!subtest) {
      continue;
    }
    const agreement = row.querySelector('.agreement')?.textContent ?? '';
    const cells = Array.from(row.querySelectorAll('.platform-cell')).map(
      (cell) => {
        const clone = cell.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('svg').forEach((svg) => svg.remove());
        return clone.textContent?.trim();
      },
    );
    result.push(`${subtest}: ${agreement} | ${cells.join(', ')}`);
  }
  return result;
}

async function clickFilterMenuItem(
  user: UserEvent,
  menuMatcher: string,
  itemMatcher: RegExp,
) {
  const columnButton = screen.getByRole('button', {
    name: new RegExp(`${menuMatcher}.*filter`),
  });
  await user.click(columnButton);
  const menu = screen.getByRole('menu');
  await user.click(within(menu).getByRole('menuitem', { name: itemMatcher }));
  await user.keyboard('{Escape}');
}

function improved(rows: CompareResultsItem[]): CompareResultsItem[] {
  return rows.map((row) => ({
    ...row,
    is_improvement: true,
    is_regression: false,
  }));
}

function regressed(rows: CompareResultsItem[]): CompareResultsItem[] {
  return rows.map((row) => ({
    ...row,
    is_improvement: false,
    is_regression: true,
  }));
}

describe('SubtestsCrossPlatformView', () => {
  it('renders one column per platform and matches the snapshot', async () => {
    const { subtestsResult } = getTestData();
    setup(
      [
        { platform: LINUX, results: improved(subtestsResult) },
        {
          platform: WINDOWS,
          results: regressed(
            cloneSubtestsForPlatform(subtestsResult, WINDOWS, 500),
          ),
        },
      ],
      'test_version=student-t',
    );

    await screen.findByText('dhtml.html');
    const header = screen.getByTestId('table-header');
    expect(within(header).getByText('Agreement')).toBeInTheDocument();
    expect(within(header).getByText('Linux 18.04')).toBeInTheDocument();
    expect(within(header).getByText('Windows 10')).toBeInTheDocument();

    // Every subtest moved one way on Linux and the other on Windows.
    for (const row of summarizeVisibleRows()) {
      expect(row).toContain('Mixed 1▲ 1▼');
    }

    expect(document.body).toMatchSnapshot();
  });

  it('shows a dash for a subtest a platform did not report', async () => {
    const { subtestsResult } = getTestData();
    setup(
      [
        { platform: LINUX, results: improved(subtestsResult) },
        {
          platform: WINDOWS,
          results: improved(
            cloneSubtestsForPlatform(subtestsResult.slice(0, 1), WINDOWS, 500),
          ),
        },
      ],
      'test_version=student-t',
    );

    await screen.findByText('dhtml.html');
    const missing = screen.getAllByLabelText(
      Strings.components.crossPlatformSubtests.missingCell,
    );
    expect(missing).toHaveLength(subtestsResult.length - 1);
  });

  it('links each cell to that platform’s subtests page', async () => {
    const { subtestsResult } = getTestData();
    const linuxRows = improved(subtestsResult);
    setup([{ platform: LINUX, results: linuxRows }], 'test_version=student-t');

    await screen.findByText('dhtml.html');
    const expectedHref = getSubtestsCompareWithBaseLink(
      linuxRows.find((row) => row.test === 'dhtml.html')!,
      'student-t',
    );
    const row = screen
      .getAllByRole('row')
      .find((candidate) =>
        candidate.querySelector('.subtests')?.textContent?.includes('dhtml'),
      )!;
    expect(row.querySelector('.platform-cell a')).toHaveAttribute(
      'href',
      expectedHref,
    );
  });

  it('filters by agreement and records it in the URL', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsResult } = getTestData();
    setup(
      [
        { platform: LINUX, results: improved(subtestsResult) },
        {
          platform: WINDOWS,
          results: improved(
            cloneSubtestsForPlatform(subtestsResult, WINDOWS, 500),
          ),
        },
      ],
      'test_version=student-t',
    );

    await screen.findByText('dhtml.html');
    expect(summarizeVisibleRows()).toHaveLength(subtestsResult.length);

    await clickFilterMenuItem(user, 'Agreement', /Select only.*Mixed/);
    expect(summarizeVisibleRows()).toHaveLength(0);
    expect(
      new URLSearchParams(window.location.search).get('filter_agreement'),
    ).toBe('mixed');
  });

  it('sorts by agreement and records it in the URL', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsResult } = getTestData();
    // One improved subtest, the rest regressed, so the sort has something to do.
    const linuxRows = subtestsResult.map((row) => ({
      ...row,
      is_improvement: row.test === 'dhtml.html',
      is_regression: row.test !== 'dhtml.html',
    }));
    setup([{ platform: LINUX, results: linuxRows }], 'test_version=student-t');

    await screen.findByText('dhtml.html');
    const agreementButton = screen.getByRole('button', {
      name: /Agreement.*sort/,
    });

    await user.click(agreementButton);
    expect(summarizeVisibleRows()[0]).toContain('dhtml.html');
    expect(new URLSearchParams(window.location.search).get('sort')).toBe(
      'agreement|desc',
    );

    await user.click(agreementButton);
    expect(summarizeVisibleRows().at(-1)).toContain('dhtml.html');
    expect(new URLSearchParams(window.location.search).get('sort')).toBe(
      'agreement|asc',
    );
  });

  it('mirrors the search box into the URL and filters the rows', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsResult } = getTestData();
    setup(
      [{ platform: LINUX, results: subtestsResult }],
      'test_version=student-t',
    );

    await screen.findByText('dhtml.html');
    const searchInput = await screen.findByRole('searchbox', {
      name: /Search by title/,
    });
    await user.type(searchInput, 'dhtml');
    // The search input is debounced.
    act(() => {
      jest.runAllTimers();
    });

    expect(summarizeVisibleRows()).toHaveLength(1);
    expect(new URLSearchParams(window.location.search).get('search')).toBe(
      'dhtml',
    );
  });

  it('still renders the other platforms when one of them fails', async () => {
    const { subtestsResult } = getTestData();
    setup(
      [
        { platform: LINUX, results: improved(subtestsResult) },
        { platform: WINDOWS, results: 500 },
      ],
      'test_version=student-t',
    );

    await screen.findByText('dhtml.html');
    expect(summarizeVisibleRows()).toHaveLength(subtestsResult.length);
    expect(
      screen.getAllByTitle(
        Strings.components.crossPlatformSubtests.platformError(WINDOWS),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('marks non-significant Mann-Whitney results as noise and shows the median delta', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    const rows = subtestsMannWhitneyResult.map((row) => ({
      ...row,
      direction_of_change: 'improvement' as const,
      mann_whitney_test: {
        test_name: 'Mann Whitney U',
        stat: 0,
        pvalue: 0.5,
        interpretation: 'not significant',
      },
    }));
    setup([{ platform: LINUX, results: rows }]);

    await screen.findByText('dhtml.html');
    // One "Noise" pill per cell (the agreement chip says "Noise" too).
    expect(document.querySelectorAll('.noise-label')).toHaveLength(rows.length);
    // A noise-only row has no agreement to report.
    for (const row of summarizeVisibleRows()) {
      expect(row).toContain('Noise');
    }
  });
});
