import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { loader } from '../../components/CompareResults/subtestsCrossPlatformLoader';
import SubtestsCrossPlatformView from '../../components/CompareResults/SubtestsResults/CrossPlatform/SubtestsCrossPlatformView';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import type { Platform } from '../../types/types';
import { getCookie } from '../../utils/cookies';
import { SORT_COOKIE } from '../../utils/tableStatePersistence';
import getTestData from '../utils/fixtures';
import {
  enableAdvancedColumns,
  renderWithRouter,
  screen,
  within,
} from '../utils/test-utils';

expect.extend(toHaveNoViolations);

const LINUX = 'linux1804-64-shippable-qr' as Platform;
const WINDOWS = 'windows11-64-24h2-shippable' as Platform;

const BASE_SEARCH =
  '?baseRev=spam&baseRepo=mozilla-central&newRev=eggs&newRepo=mozilla-central&framework=1&test_version=student-t';

type PlatformMock = {
  platform: Platform;
  // A number mocks an HTTP error status.
  response: CompareResultsItem[] | number;
};

function renderView(platforms: PlatformMock[], extraSearch = '') {
  let search = BASE_SEARCH;
  platforms.forEach(({ platform, response }, index) => {
    const baseSignature = String(100 + index);
    fetchMock.get(
      ({ url }) =>
        new URL(url).searchParams.get('base_parent_signature') ===
        baseSignature,
      response,
    );
    search += `&baseParentSignature=${baseSignature}&newParentSignature=${200 + index}&platform=${platform}`;
  });

  return renderWithRouter(
    <SubtestsCrossPlatformView
      title={Strings.metaData.pageTitle.subtestsCrossPlatform}
    />,
    {
      route: '/subtests-cross-platform-results/',
      search: search + extraSearch,
      loader,
    },
  );
}

// Linux reports the fixture's outcomes as is; Windows regresses everywhere.
function linuxAndRegressedWindows(): PlatformMock[] {
  const { subtestsResult } = getTestData();
  return [
    { platform: LINUX, response: subtestsResult },
    {
      platform: WINDOWS,
      response: subtestsResult.map((result) => ({
        ...result,
        platform: WINDOWS,
        is_improvement: false,
        is_regression: true,
      })),
    },
  ];
}

function visibleRows() {
  return screen
    .getAllByRole('row')
    .filter((row) => row.classList.contains('matrix-row'))
    .map(
      (row) =>
        // The chip only shows icons and counts: its accessible name spells
        // them out.
        `${row.querySelector('.subtests')?.textContent} — ${row
          .querySelector('.agreement-chip')
          ?.getAttribute('aria-label')}`,
    );
}

describe('SubtestsCrossPlatformView', () => {
  it('shows a column per platform, strongest regressions first', async () => {
    const { container } = renderView(linuxAndRegressedWindows());

    await screen.findByText('regression.html');
    const header = screen.getByTestId('table-header');
    expect(within(header).getByText('Linux 18.04')).toBeInTheDocument();
    expect(within(header).getByText('Windows 11')).toBeInTheDocument();
    expect(
      within(header).getByRole('button', {
        name: /Agreement \(Currently sorted/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 platforms')).toBeInTheDocument();

    expect(visibleRows().slice(0, 3)).toEqual([
      'regression.html — Consistent regression: 2 regressed, 0 improved, 0 unchanged.',
      'dhtml.html — Partial regression: 1 regressed, 0 improved, 1 unchanged.',
      'tablemutation.html — Partial regression: 1 regressed, 0 improved, 1 unchanged.',
    ]);

    // axe schedules work on timers.
    jest.useRealTimers();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('links each cell to the subtests of its platform', async () => {
    renderView(linuxAndRegressedWindows());

    const cell = await screen.findByRole('link', {
      name: 'Windows 11: Regression +1.04 %',
    });
    const url = new URL(cell.getAttribute('href')!, window.location.href);
    expect(url.pathname).toBe('/subtests-compare-results');
    expect(url.searchParams.get('baseParentSignature')).toBe('101');
    expect(url.searchParams.get('newParentSignature')).toBe('201');
    expect(url.searchParams.get('search')).toBe('regression.html');
  });

  it('passes the current Advanced options on to the cell links', async () => {
    // Not in this view's URL: they come from the current state.
    enableAdvancedColumns();
    renderView(linuxAndRegressedWindows());

    const cell = await screen.findByRole('link', {
      name: 'Windows 11: Regression +1.04 %',
    });
    const url = new URL(cell.getAttribute('href')!, window.location.href);
    expect(url.searchParams.get('advanced_columns')).toContain('cliffs_delta');
  });

  it('filters by agreement and keeps the state out of the cookies', async () => {
    renderView(linuxAndRegressedWindows());
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await screen.findByText('regression.html');
    await user.click(
      screen.getByRole('button', { name: /Agreement.*filter values/ }),
    );
    const menu = screen.getByRole('menu');
    await user.click(
      within(menu).getByRole('menuitemcheckbox', {
        name: /^Consistent regression/,
      }),
    );
    await user.keyboard('{Escape}');

    expect(visibleRows()).toEqual([
      'dhtml.html — Partial regression: 1 regressed, 0 improved, 1 unchanged.',
      'tablemutation.html — Partial regression: 1 regressed, 0 improved, 1 unchanged.',
      'improvement.html — Mixed: 1 regressed, 1 improved, 0 unchanged.',
    ]);
    expect(window.location.search).not.toContain('consistent-regression');
    expect(window.location.search).toContain('filter_agreement=');
    expect(screen.getByText(/hidden by/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Agreement \(Currently sorted/ }),
    );
    expect(window.location.search).toContain('sort=agreement%7Casc');
    expect(getCookie(SORT_COOKIE)).toBeNull();
  });

  it('flags a platform that failed to load', async () => {
    const { subtestsResult } = getTestData();
    renderView([
      { platform: LINUX, response: subtestsResult },
      { platform: WINDOWS, response: 500 },
    ]);

    await screen.findByText('regression.html');
    expect(
      screen.getAllByTitle(
        Strings.components.crossPlatformSubtests.platformError(WINDOWS),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('shows an error when every platform failed', async () => {
    renderView([
      { platform: LINUX, response: 500 },
      { platform: WINDOWS, response: 500 },
    ]);

    expect(
      await screen.findByText(
        Strings.components.crossPlatformSubtests.allPlatformsFailed,
      ),
    ).toBeInTheDocument();
  });
});
