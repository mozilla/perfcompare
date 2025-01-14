import type { ReactElement } from 'react';

import userEvent, { type UserEvent } from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  within,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/',
    search: '?baseRev=spam&baseRepo=try&framework=1',
    loader,
  });
}

function setupAndRender(testCompareData: CompareResultsItem[]) {
  const { testData } = getTestData();
  (window.fetch as FetchMockSandbox)
    .get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      testCompareData,
    )
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [testData[0]],
    });
  renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
}

// This handy function parses the results page and returns an array of visible
// rows. It makes it easy to assert visible rows when filtering them in a
// user-friendly way without using snapshots.
function summarizeVisibleRows() {
  const rowGroups = screen.getAllByRole('rowgroup');
  const result = [];

  for (const group of rowGroups) {
    const titleElement = group.firstElementChild!.firstElementChild!;
    const optionsElements = Array.from(
      titleElement.nextElementSibling!.children,
    );
    const title = [
      titleElement.textContent,
      ...optionsElements.map((element) => element.textContent),
    ].join(' ');
    result.push(title);

    const revisionGroups = Array.from(group.children).slice(1) as HTMLElement[];

    for (const revisionGroup of revisionGroups) {
      const maybeLink = within(revisionGroup).queryByRole('link', {
        name: /open treeherder view/,
      });
      if (maybeLink) {
        result.push('  rev: ' + maybeLink.textContent!);
      }

      const rows = within(revisionGroup).getAllByRole('row');
      for (const row of rows) {
        const rowString = ['.platform span', '.status', '.confidence']
          .map((selector) => row.querySelector(selector)!.textContent!.trim())
          .join(', ');

        result.push('  - ' + rowString);
      }
    }
  }

  return result;
}

function summarizeTableFiltersFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const result: Record<string, string[]> = {};
  for (const [key, value] of searchParams) {
    if (!key.startsWith('filter_')) {
      continue;
    }

    const values = value.split(',');
    result[key.slice('filter_'.length)] = values;
  }
  return result;
}

async function clickMenuItem(
  user: UserEvent,
  menuMatcher: string | RegExp,
  itemMatcher: string | RegExp,
) {
  const platformColumnButton = screen.getByRole('button', {
    name: menuMatcher,
  });
  await user.click(platformColumnButton);

  const menu = screen.getByRole('menu');
  let menuItem = within(menu).queryByRole('menuitemcheckbox', {
    name: itemMatcher,
  });
  if (!menuItem) {
    menuItem = within(menu).getByRole('menuitem', {
      name: itemMatcher,
    });
  }
  await user.click(menuItem);
  await user.keyboard('[Escape]');
}

describe('Results Table', () => {
  it('Should match snapshot', async () => {
    const { testCompareData } = getTestData();

    const compareDataToChange = testCompareData.at(-1)!;
    Object.assign(compareDataToChange, {
      extra_options: '',
      header_name: `${compareDataToChange.suite} ${compareDataToChange.test} ${compareDataToChange.option_name}`,
    });

    setupAndRender(testCompareData);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Display message for not finding results', async () => {
    setupAndRender([]);
    expect(await screen.findByText(/No results found/)).toBeInTheDocument();
  });

  it('should render different blocks when rendering several revisions', async () => {
    const { testCompareData } = getTestData();
    const simplerTestCompareData = [
      testCompareData[0],
      { ...testCompareData[0], new_rev: 'devilrabbit' },
    ];

    setupAndRender(simplerTestCompareData);
    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - OS X 10.15, Improvement, Low',
      '  rev: devilrabbit',
      '  - OS X 10.15, Improvement, Low',
    ]);
    expect(screen.getByRole('rowgroup')).toMatchSnapshot();
  });

  it('should filter on the Platform column', async () => {
    const { testCompareData } = getTestData();
    testCompareData.push({
      ...testCompareData[0],
      platform: 'android-em-7-0-x86_64-lite-qr',
    });
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
      '  - Android, Improvement, Low',
    ]);

    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Platform/, /Windows/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'linux', 'android'],
    });

    await clickMenuItem(user, /Platform/, /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android'],
    });

    await clickMenuItem(user, /Platform/, /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'linux', 'android'],
    });

    await clickMenuItem(user, /Platform/, 'Select all values');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, /Platform/, /macOS/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'android'],
    });

    await clickMenuItem(user, /Platform/, /Android/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux'],
    });

    await clickMenuItem(user, /Platform/, /Select only.*Android/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['android'],
    });
  });

  it('should filter on the Status column', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Status/, /No changes/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['improvement', 'regression'],
    });

    await clickMenuItem(user, /Status/, /Select all values/);
    await clickMenuItem(user, /Status/, /Improvement/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none', 'regression'],
    });

    await clickMenuItem(user, /Status/, /Regression/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none'],
    });

    await clickMenuItem(user, /Status/, /Select only.*Regression/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['regression'],
    });
  });

  it('should filter on the Confidence column', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Confidence/, /Low/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none', 'medium', 'high'],
    });

    await clickMenuItem(user, /Confidence/, /High/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none', 'medium'],
    });

    await clickMenuItem(user, /Confidence/, /Medium/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none'],
    });

    await clickMenuItem(user, /Confidence/, /Select all values/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
      '  - Windows 10, -, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, /Confidence/, /No value/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OS X 10.15, Improvement, Low',
      '  - Linux 18.04, Regression, Medium',
      '  - Windows 10, -, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['low', 'medium', 'high'],
    });

    await clickMenuItem(user, /Confidence/, /Select only.*High/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['high'],
    });
  });
});
