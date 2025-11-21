import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../types/state';
import type { Platform } from '../../types/types';
import getTestData, {
  augmentCompareDataWithSeveralTests,
  augmentCompareDataWithSeveralRevisions,
} from '../utils/fixtures';
import { renderWithRouter, screen, within } from '../utils/test-utils';

function renderWithRoute(component: ReactElement, extraParameters?: string) {
  return renderWithRouter(component, {
    route: '/compare-results/',
    search:
      '?baseRev=spam&baseRepo=try&framework=1' +
      (extraParameters ? '&' + extraParameters : ''),
    loader,
  });
}

function setupAndRender(
  testCompareData: CompareResultsItem[] | MannWhitneyResultsItem[],
  extraParameters?: string,
) {
  const { testData } = getTestData();
  fetchMock
    .get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      testCompareData,
    )
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [testData[0]],
    });
  renderWithRoute(
    <ResultsView title={Strings.metaData.pageTitle.results} />,
    extraParameters,
  );
}

// This handy function parses the results page and returns an array of visible
// rows. It makes it easy to assert visible rows when filtering them in a
// user-friendly way without using snapshots.
function summarizeVisibleRows(test_version?: string) {
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
        result.push('  rev: ' + maybeLink.textContent);
      }

      const rows = within(revisionGroup).getAllByRole('row');
      for (const row of rows) {
        const rowClasses =
          test_version === 'mann-whitney-u'
            ? [
                '.platform span',
                '.status',
                '.delta',
                '.significance',
                '.effects',
              ]
            : ['.platform span', '.status', '.delta', '.confidence'];
        const rowString = rowClasses
          .map(
            (selector) =>
              (selector && row.querySelector(selector)?.textContent?.trim()) ??
              '',
          )
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

async function summarizeTableFiltersFromCheckboxes(user: UserEvent) {
  const result: Record<string, string[]> = {};
  const columnButtons = screen.getAllByRole('button', {
    name: /Click to filter values/,
  });
  for (const columnButton of columnButtons) {
    const menuName = columnButton.textContent ?? '';

    await user.click(columnButton);
    const menu = screen.getByRole('menu');
    const menuItemsChecked = within(menu)
      .getAllByRole('menuitemcheckbox', { checked: true })
      .map((item) => item.textContent ?? '');

    result[menuName] = menuItemsChecked;
    await user.keyboard('[Escape]');
  }

  return result;
}

function expectParameterToHaveValue(parameter: string, expectedValue: string) {
  const searchParams = new URLSearchParams(window.location.search);
  const currentValue = searchParams.get(parameter);
  expect(currentValue).toEqual(expectedValue);
}

async function clickMenuItem(
  user: UserEvent,
  menuMatcher: string,
  itemMatcher: string | RegExp,
) {
  const columnButton = screen.getByRole('button', {
    name: new RegExp(`${menuMatcher}.*filter`),
  });
  await user.click(columnButton);

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
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  rev: devilrabbit',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    expect(screen.getByRole('rowgroup')).toMatchSnapshot();
  });

  it('should filter on the Platform column', async () => {
    const { testCompareData } = getTestData();
    testCompareData.push(
      {
        ...testCompareData[0],
        platform: 'android-em-7-0-x86_64-lite-qr',
      },
      // This entry with an unknown platform will show up only when all values
      // are checked.
      {
        ...testCompareData[0],
        platform: 'inexistant' as Platform,
      },
    );
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - inexistant, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);

    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'linux', 'android', 'ios'],
    });

    // Clicking Windows again should remove the search param and make the
    // "inexitant" platform visible again.
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - inexistant, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /Windows/);
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios', 'linux'],
    });

    await clickMenuItem(user, 'Platform', 'Select all values');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - inexistant, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /macOS/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Android/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Select only.*Android/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 1.08 %, Low',
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
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Status', /No changes/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['improvement', 'regression'],
    });

    await clickMenuItem(user, 'Status', /Select all values/);
    await clickMenuItem(user, 'Status', /Improvement/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none', 'regression'],
    });

    await clickMenuItem(user, 'Status', /Regression/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none'],
    });

    await clickMenuItem(user, 'Status', /Select only.*Regression/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
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
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Confidence', /Low/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none', 'medium', 'high'],
    });

    await clickMenuItem(user, 'Confidence', /High/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -24 %, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none', 'medium'],
    });

    await clickMenuItem(user, 'Confidence', /Medium/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, -24 %, -',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['none'],
    });

    await clickMenuItem(user, 'Confidence', /Select all values/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Confidence', /No value/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['low', 'medium', 'high'],
    });

    // Clicking again to select it should make the search param disappear
    await clickMenuItem(user, 'Confidence', /No value/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Confidence', /Select only.*High/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      confidence: ['high'],
    });
  });

  it('can load the filter parameters from the URL', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'filter_platform=android,osx,foo');
    await screen.findByText('dhtml.html');

    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    expect(await summarizeTableFiltersFromCheckboxes(user)).toEqual({
      'Platform(2)': ['macOS', 'Android'],
      'Status(3)': ['No changes', 'Improvement', 'Regression'],
      'Confidence(4)': ['No value', 'Low', 'Medium', 'High'],
    });

    // After a change, "foo" should disappear
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'linux'],
    });
  });

  it('can sort the table and persist the sort parameters to the URL', async () => {
    const { testCompareData } = getTestData();
    const testCompareDataForSorting = augmentCompareDataWithSeveralRevisions(
      augmentCompareDataWithSeveralTests(testCompareData),
    );
    setupAndRender(testCompareDataForSorting);
    await screen.findByText('dhtml.html');

    // This is the initial situation.
    expect(summarizeVisibleRows()).toEqual([
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Linux 18.04, Regression, 1.97 %, Medium',
      '  - macOS 10.15, Improvement, 1.2 %, Low',
      '  - Windows 10, -, -23.88 %, -',
      '  - Windows 10, -, -2.28 %, High',
      '  rev: tictactoe',
      '  - Linux 18.04, Regression, 2.05 %, Medium',
      '  - macOS 10.15, Improvement, 1.28 %, Low',
      '  - Windows 10, -, -23.8 %, -',
      '  - Windows 10, -, -2.2 %, High',
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
      '  rev: tictactoe',
      '  - Linux 18.04, Regression, 1.93 %, Medium',
      '  - macOS 10.15, Improvement, 1.16 %, Low',
      '  - Windows 10, -, -23.92 %, -',
      '  - Windows 10, -, -2.32 %, High',
    ]);
    expect(window.location.search).not.toContain('sort=');

    // Sort by Delta
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const deltaButton = screen.getByRole('button', { name: /Delta/ });
    expect(deltaButton).toMatchSnapshot();
    // Sort descending
    await user.click(deltaButton);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  rev: tictactoe',
      '  - Windows 10, -, -23.92 %, -',
      '  - Windows 10, -, -2.32 %, High',
      '  - Linux 18.04, Regression, 1.93 %, Medium',
      '  - macOS 10.15, Improvement, 1.16 %, Low',
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -, -23.88 %, -',
      '  - Windows 10, -, -2.28 %, High',
      '  - Linux 18.04, Regression, 1.97 %, Medium',
      '  - macOS 10.15, Improvement, 1.2 %, Low',
      '  rev: tictactoe',
      '  - Windows 10, -, -23.8 %, -',
      '  - Windows 10, -, -2.2 %, High',
      '  - Linux 18.04, Regression, 2.05 %, Medium',
      '  - macOS 10.15, Improvement, 1.28 %, Low',
    ]);
    // It should have the "descending" SVG.
    expect(deltaButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'delta|desc');

    // sort ascending
    await user.click(deltaButton);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -2.4 %, High',
      '  - Windows 10, -, -24 %, -',
      '  rev: tictactoe',
      '  - macOS 10.15, Improvement, 1.16 %, Low',
      '  - Linux 18.04, Regression, 1.93 %, Medium',
      '  - Windows 10, -, -2.32 %, High',
      '  - Windows 10, -, -23.92 %, -',
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - macOS 10.15, Improvement, 1.2 %, Low',
      '  - Linux 18.04, Regression, 1.97 %, Medium',
      '  - Windows 10, -, -2.28 %, High',
      '  - Windows 10, -, -23.88 %, -',
      '  rev: tictactoe',
      '  - macOS 10.15, Improvement, 1.28 %, Low',
      '  - Linux 18.04, Regression, 2.05 %, Medium',
      '  - Windows 10, -, -2.2 %, High',
      '  - Windows 10, -, -23.8 %, -',
    ]);
    // It should have the "ascending" SVG.
    expect(deltaButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'delta|asc');

    // Sort by Confidence descending
    const confidenceButton = screen.getByRole('button', {
      name: /Confidence.*sort/,
    });
    await user.click(confidenceButton);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - Windows 10, -, -2.2 %, High',
      '  - Linux 18.04, Regression, 2.05 %, Medium',
      '  - macOS 10.15, Improvement, 1.28 %, Low',
      '  - Windows 10, -, -23.8 %, -',
      '  rev: spam',
      '  - Windows 10, -, -2.28 %, High',
      '  - Linux 18.04, Regression, 1.97 %, Medium',
      '  - macOS 10.15, Improvement, 1.2 %, Low',
      '  - Windows 10, -, -23.88 %, -',
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - Windows 10, -, -2.32 %, High',
      '  - Linux 18.04, Regression, 1.93 %, Medium',
      '  - macOS 10.15, Improvement, 1.16 %, Low',
      '  - Windows 10, -, -23.92 %, -',
      '  rev: spam',
      '  - Windows 10, -, -2.4 %, High',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
    ]);
    // It should have the "no sort" SVG.
    expect(deltaButton).toMatchSnapshot();
    // It should have the "descending" SVG.
    expect(confidenceButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'confidence|desc');
  });

  it('can load the sort parameters from the URL for an ascending sort', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'sort=delta|asc');
    await screen.findByText('dhtml.html');

    // It should have the "ascending" SVG.
    const deltaButton = screen.getByRole('button', { name: /Delta/ });
    expect(deltaButton).toMatchSnapshot();

    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - Windows 10, -, -2.4 %, High',
      '  - Windows 10, -, -24 %, -',
    ]);

    // And clicking the button once should move it back to the initial state.
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(deltaButton);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    expect(window.location.search).not.toContain('sort=');
  });

  it('can load the sort parameters from the URL for a descending sort', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'sort=delta|desc');
    await screen.findByText('dhtml.html');

    // It should have the "descending" SVG.
    const deltaButton = screen.getByRole('button', { name: /Delta/ });
    expect(deltaButton).toMatchSnapshot();

    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
    ]);
  });
});

describe('Results Table with mann-whitney-u testVersion data', () => {
  it('Should match snapshot', async () => {
    const { testCompareMannWhitneyData } = getTestData();

    const compareDataToChange = testCompareMannWhitneyData.at(-1)!;
    Object.assign(compareDataToChange, {
      extra_options: '',
      header_name: `${compareDataToChange.suite} ${compareDataToChange.test} ${compareDataToChange.option_name}`,
    });

    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Display message for not finding results', async () => {
    setupAndRender([], 'test_version=mann-whitney-u');
    expect(await screen.findByText(/No results found/)).toBeInTheDocument();
  });

  it('should render different blocks when rendering several revisions', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    const simplerTestCompareData = [
      testCompareMannWhitneyData[0],
      { ...testCompareMannWhitneyData[0], new_rev: 'devilrabbit' },
    ];

    setupAndRender(simplerTestCompareData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  rev: devilrabbit',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(screen.getByRole('rowgroup')).toMatchSnapshot();
  });

  it('should filter on the Platform column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    testCompareMannWhitneyData.push(
      {
        ...testCompareMannWhitneyData[0],
        platform: 'android-em-7-0-x86_64-lite-qr',
      },
      // This entry with an unknown platform will show up only when all values
      // are checked.
      {
        ...testCompareMannWhitneyData[0],
        platform: 'inexistant' as Platform,
      },
    );
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - inexistant, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);

    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'linux', 'android', 'ios'],
    });

    // Clicking Windows again should remove the search param and make the
    // "inexitant" platform visible again.
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - inexistant, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /Windows/);
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios', 'linux'],
    });

    await clickMenuItem(user, 'Platform', 'Select all values');
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - inexistant, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /macOS/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Android/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Select only.*Android/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['android'],
    });
  });

  it('should filter on the Status column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Status', /No changes/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['improvement', 'regression'],
    });

    await clickMenuItem(user, 'Status', /Improvement/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['regression'],
    });

    await clickMenuItem(user, 'Status', /Select all values/);
    await clickMenuItem(user, 'Status', /Regression/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none', 'improvement'],
    });

    await clickMenuItem(user, 'Status', /Regression/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
      '  - Windows 10, , -, significant, 100.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Status', /Select only.*Regression/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, -, not significant, 45.00 %',
      '  - Windows 10, Regression, -, significant, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['regression'],
    });

    await clickMenuItem(user, 'Status', /Select only.*Improvement/);
    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['improvement'],
    });
  });

  it('should filter on the Significance column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, '?baseRev=spam&baseRepo=try&framework=1&test_version=mann-whitney-u');

    // const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    // await screen.findByRole('menuitem', { name: 'Significance' });
    const significanceMenu = await screen.findAllByText(/Significance/)
    expect(significanceMenu.length).toBe(2)
    // await clickMenuItem(user, 'Significance', /Select all values/);
    // expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
    //   'a11yr dhtml.html spam opt e10s fission stylo webrender',
    //   '  - Linux 18.04, Regression, -, not significant, 45.00 %',
    //   '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    //   '  - Windows 10, Regression, -, significant, 50.00 %',
    // ]);
    // expect(summarizeTableFiltersFromUrl()).toEqual({
    //   significance: ['significant', 'not significant'],
    // });
    // await clickMenuItem(user, 'Significance', /Select all values/);
    // await clickMenuItem(user, 'Significance', /Not Significant/);
    // expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
    //   'a11yr dhtml.html spam opt e10s fission stylo webrender',
    //   '  - Linux 18.04, Regression, -, not significant, 45.00 %',
    //   '  - Windows 10, Regression, -, significant, 50.00 %',
    // ]);
    // expect(summarizeTableFiltersFromUrl()).toEqual({
    //   significance: ['not significant'],
    // });

  });

  it('can load the filter parameters from the URL', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(
      testCompareMannWhitneyData,
      'filter_platform=android,osx,foo&test_version=mann-whitney-u',
    );
    await screen.findByText('dhtml.html');

    expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, Improvement, 0.1, not significant, 25.00 %',
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    expect(await summarizeTableFiltersFromCheckboxes(user)).toEqual({
      'Platform(2)': ['macOS', 'Android'],
      'Significance(2)': ['Significant', 'Not Significant'],
      'Status(3)': ['No changes', 'Improvement', 'Regression'],
    });

    // After a change, "foo" should disappear
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'linux'],
    });
  });
});
