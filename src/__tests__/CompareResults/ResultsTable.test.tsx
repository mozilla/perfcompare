import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import type { CombinedResultsItemType } from '../../types/state';
import type { Platform, TestVersion } from '../../types/types';
import getTestData, {
  augmentCompareDataWithSeveralTests,
  augmentCompareDataWithSeveralRevisions,
  augmentCompareMannWhitneyDataWithSeveralRevisions,
  augmentCompareMannWhitneyDataWithSeveralTests,
} from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  waitFor,
  within,
  enableAdvancedColumns,
} from '../utils/test-utils';

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
  testCompareData: CombinedResultsItemType[],
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
function summarizeVisibleRows(testVersion?: TestVersion, advanced = false) {
  const rowGroups = screen.getAllByRole('rowgroup');
  const result = [];

  for (const group of rowGroups) {
    const titleElement = group.firstElementChild!.firstElementChild!;
    const optionsElements = Array.from(
      titleElement.nextElementSibling!.children,
    );
    // The "better direction" indicator is asserted separately (and via
    // snapshots); strip it here so the data-focused expectations stay stable.
    const titleClone = titleElement.cloneNode(true) as HTMLElement;
    titleClone
      .querySelector('[data-testid="better-direction-indicator"]')
      ?.remove();
    const title = [
      titleClone.textContent,
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
          testVersion === 'mann-whitney-u'
            ? advanced
              ? [
                  '.platform span',
                  '.median-diff',
                  '.status-hint',
                  '.delta',
                  '.significance',
                  '.effects',
                ]
              : [
                  '.platform span',
                  '.median-diff',
                  '.status-hint',
                  '.magnitude',
                  '.significance',
                ]
            : ['.platform span', '.status', '.delta', '.confidence'];
        const rowString = rowClasses
          .map((selector) => {
            const cell = row.querySelector(selector);
            if (!cell) return undefined;
            // Strip icon <title> text (e.g. the median-diff normality warning)
            // so the data-focused expectations stay stable; icon presence is
            // asserted separately.
            const clone = cell.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('svg').forEach((svg) => svg.remove());
            return clone.textContent?.trim();
          })
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

    setupAndRender(simplerTestCompareData, 'test_version=student-t');
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
    setupAndRender(testCompareData, 'test_version=student-t');

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
    setupAndRender(testCompareData, 'test_version=student-t');

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
    setupAndRender(testCompareData, 'test_version=student-t');

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
    setupAndRender(
      testCompareData,
      'filter_platform=android,osx,foo&test_version=student-t',
    );
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
    setupAndRender(testCompareDataForSorting, 'test_version=student-t');
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
    setupAndRender(testCompareData, 'sort=delta|asc&test_version=student-t');
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
    setupAndRender(testCompareData, 'sort=delta|desc&test_version=student-t');
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

describe('Results Table for MannWhitneyResultsItem for mann-whitney-u testVersion', () => {
  // These tests exercise the full (advanced) table — CD, CLES, Sig columns and
  // their sort/filter behavior. The simplified default view (which hides
  // CD/CLES and shows the Magnitude column) is covered separately below.
  beforeEach(() => {
    enableAdvancedColumns();
  });

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
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  rev: devilrabbit',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(screen.getByRole('rowgroup')).toMatchSnapshot();
  });

  it('should filter on the Platform column for mann-whitney-u test_version', async () => {
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
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - inexistant, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);

    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'linux', 'android', 'ios'],
    });

    // Clicking Windows again should remove the search param and make the
    // "inexitant" platform visible again.
    await clickMenuItem(user, 'Platform', /Windows/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - inexistant, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /Windows/);
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'ios', 'linux'],
    });

    await clickMenuItem(user, 'Platform', 'Select all values');
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - inexistant, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    await clickMenuItem(user, 'Platform', /macOS/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'android', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Android/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['windows', 'linux', 'ios'],
    });

    await clickMenuItem(user, 'Platform', /Select only.*Android/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Android, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['android'],
    });
  });

  it('should filter on the Significance column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Filter only "Real" (significant)
    const signifianceMenu = await screen.findByRole('button', {
      name: /Sig.*filter/,
    });
    await user.click(signifianceMenu);
    expect(signifianceMenu).toMatchSnapshot();

    // "Real" is item 0, "Noise" (not significant) is item 1
    const significantOptions = await screen.findAllByRole('menuitemcheckbox', {
      name: /Real|Noise/,
    });
    await user.click(significantOptions[1]);
    await user.keyboard('[Escape]');
    expect(summarizeTableFiltersFromUrl()).toEqual({
      significance: ['significant'],
    });
  });

  it('should filter on the Status column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Noise is mutually exclusive with the direction buckets: selecting only
    // Noise shows the not-significant rows regardless of their direction.
    await clickMenuItem(user, 'Status', /Select only.*Noise/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({ status: ['noise'] });

    // Unchecking Noise (the three direction buckets stay checked) hides the
    // noisy rows and leaves only the real (significant) rows.
    await clickMenuItem(user, 'Status', /Select all values/);
    await clickMenuItem(user, 'Status', /^Noise/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['none', 'improvement', 'regression'],
    });

    // A direction bucket only matches real rows, so "No changes" shows the two
    // significant no-change rows.
    await clickMenuItem(user, 'Status', /Select only.*No changes/);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    expect(summarizeTableFiltersFromUrl()).toEqual({ status: ['none'] });
  });

  it('can load the filter parameters from the URL on mann-whitney-u test_version', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(
      testCompareMannWhitneyData,
      'filter_platform=android,osx,foo&test_version=mann-whitney-u',
    );
    await screen.findByText('dhtml.html');

    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    expect(await summarizeTableFiltersFromCheckboxes(user)).toEqual({
      'Platform(2)': ['macOS', 'Android'],
      'Sig(2)': ['Real', 'Noise'],
      'Status(4)': ['No changes', 'Improvement', 'Regression', 'Noise'],
    });

    // After a change, "foo" should disappear
    await clickMenuItem(user, 'Platform', /Linux/);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      platform: ['osx', 'android', 'linux'],
    });
  });

  it('can sort params from the URL on mann-whitney-u test_version', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    const testCompareDataForSorting =
      augmentCompareMannWhitneyDataWithSeveralRevisions(
        augmentCompareMannWhitneyDataWithSeveralTests(
          testCompareMannWhitneyData,
        ),
      );
    setupAndRender(testCompareDataForSorting, 'test_version=mann-whitney-u');
    await screen.findByText('dhtml.html');
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Sort by Cliff's Delta
    const deltaButton = screen.getByRole('button', { name: /CD/ });
    expect(deltaButton).toMatchSnapshot();

    // // Sort descending
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      '  rev: tictactoe',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Windows 10, -, , 2, Real, 98.00 %',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
      '  rev: tictactoe',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
    ]);
    // It should have the "descending" SVG.
    expect(deltaButton).toMatchSnapshot();
    // It should be persisted in the URL
    expect(window.location.search).not.toContain('sort=');

    // sort ascending
    await user.click(deltaButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
      '  - Windows 10, -, , 2, Real, 98.00 %',
      '  rev: spam',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      '  rev: spam',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
    ]);
    // It should have the "ascending" SVG.
    expect(deltaButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'delta|desc');

    // Sort by Significance descending
    const significanceButton = screen.getByRole('button', {
      name: /Sig.*sort/,
    });
    await user.click(significanceButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
      '  - Windows 10, -, , 2, Real, 98.00 %',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
      '  rev: spam',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: tictactoe',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
      '  rev: spam',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
    ]);
    // It should have the "descending" SVG.
    expect(significanceButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'significance|desc');

    // Sort by Significance ascending
    await user.click(significanceButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
      '  - Windows 10, -, , 2, Real, 98.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
    ]);
    // It should have the "descending" SVG.
    expect(significanceButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'significance|asc');

    // Sort by Effect Size (%) descending
    const effectSizeButton = screen.getByRole('button', {
      name: /CLES.*sort/,
    });
    await user.click(effectSizeButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -, , 2, Real, 98.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
    ]);

    expect(effectSizeButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'effects|desc');

    // Sort by Effect Size (%) ascending
    await user.click(effectSizeButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toEqual([
      'a11yr dhtml.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -2.40%, , -, Real, 50.00 %',
      '  - Linux 18.04, +1.85%, Regression, -, Noise, 45.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.1, Noise, 25.00 %',
      '  - Windows 10, -, , -, Real, 100.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -2.40%, , 0.8, Real, 49.00 %',
      '  - Linux 18.04, +1.85%, Regression, 0.8, Noise, 44.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 0.9, Noise, 24.00 %',
      '  - Windows 10, -, , 0.8, Real, 99.00 %',
      'a11yr aria.html opt e10s fission stylo webrender',
      '  rev: spam',
      '  - Windows 10, -2.40%, , 1.2, Real, 49.00 %',
      '  - Linux 18.04, +1.85%, Regression, 1.2, Noise, 44.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 1.3, Noise, 24.00 %',
      '  - Windows 10, -, , 1.2, Real, 99.00 %',
      '  rev: tictactoe',
      '  - Windows 10, -2.40%, , 2, Real, 48.00 %',
      '  - Linux 18.04, +1.85%, Regression, 2, Noise, 43.00 %',
      '  - macOS 10.15, +1.08%, Improvement, 2.1, Noise, 23.00 %',
      '  - Windows 10, -, , 2, Real, 98.00 %',
    ]);
    expect(effectSizeButton).toMatchSnapshot();
    // It should be persisted in the URL
    expectParameterToHaveValue('sort', 'effects|asc');

    // Sort by Δ Median descending
    const medianDiffButton = screen.getByRole('button', {
      name: /Δ Median.*sort/,
    });
    await user.click(medianDiffButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toMatchSnapshot();
    expect(medianDiffButton).toMatchSnapshot();
    expectParameterToHaveValue('sort', 'median-diff|desc');

    // Sort by MD(%) ascending
    await user.click(medianDiffButton);
    expect(summarizeVisibleRows('mann-whitney-u', true)).toMatchSnapshot();
    expect(medianDiffButton).toMatchSnapshot();
    expectParameterToHaveValue('sort', 'median-diff|asc');
  });

  it('should switch between Student-T and Mann-Whitney-U test versions', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t');
    await screen.findByText('a11yr');
    expectParameterToHaveValue('test_version', 'student-t');
    const testVersionDropdown = screen.getByRole('combobox', {
      name: 'Stats Test Version',
    });
    expect(testVersionDropdown).toBeInTheDocument();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(testVersionDropdown);
    const mannWhitneyOption = await screen.findByRole('option', {
      name: 'Mann-Whitney-U',
    });
    await user.click(mannWhitneyOption);

    // Wait for the URL to update with the new test version
    await waitFor(() => {
      expectParameterToHaveValue('test_version', 'mann-whitney-u');
    });
  });

  it('should remove replicates parameter when switching from Mann-Whitney-U to Student-T', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=mann-whitney-u&replicates=');
    await screen.findByText('a11yr');

    // Verify initial state
    expectParameterToHaveValue('test_version', 'mann-whitney-u');
    expectParameterToHaveValue('replicates', '');

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const testVersionDropdown = screen.getByRole('combobox', {
      name: 'Stats Test Version',
    });
    await user.click(testVersionDropdown);
    const studentTOption = await screen.findByRole('option', {
      name: 'Student-T',
    });
    await user.click(studentTOption);

    // Wait for the URL to update - replicates should be removed
    await waitFor(() => {
      expectParameterToHaveValue('test_version', 'student-t');
      const searchParams = new URLSearchParams(window.location.search);
      expect(searchParams.has('replicates')).toBe(false);
    });
  });
});

describe('Advanced-columns toggle for mann-whitney-u testVersion', () => {
  it('shows Magnitude but hides CD/CLES/Sig in the simplified (default) view', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    const header = screen.getByTestId('table-header');
    // Only Magnitude is shown in the simplified view; CD/CLES/Sig are all
    // advanced columns and hidden by default.
    expect(header.querySelector('.magnitude-header')).toBeTruthy();
    expect(header.querySelector('.significance-header')).toBeFalsy();
    expect(header.querySelector('.delta-header')).toBeFalsy();
    expect(header.querySelector('.effects-header')).toBeFalsy();
  });

  it('reveals CD/CLES/Sig and hides Magnitude when advanced columns are enabled', async () => {
    enableAdvancedColumns();
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    const header = screen.getByTestId('table-header');
    expect(header.querySelector('.delta-header')).toBeTruthy();
    expect(header.querySelector('.effects-header')).toBeTruthy();
    expect(header.querySelector('.significance-header')).toBeTruthy();
    expect(header.querySelector('.magnitude-header')).toBeFalsy();
  });

  it('can filter on the Magnitude column', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');
    expect(summarizeTableFiltersFromUrl()).toEqual({});

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await clickMenuItem(user, 'Magnitude', /Select only.*Negligible/);
    expect(summarizeTableFiltersFromUrl()).toEqual({
      magnitude: ['negligible'],
    });
  });

  it('toggles Cliff’s Delta and CLES independently from the Advanced columns dropdown', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    const header = () => screen.getByTestId('table-header');
    // Simplified default: neither advanced column.
    expect(header().querySelector('.delta-header')).toBeFalsy();
    expect(header().querySelector('.effects-header')).toBeFalsy();

    // Open the dropdown and enable Cliff's Delta only.
    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );
    await user.click(screen.getByRole('option', { name: "Cliff's Delta" }));
    expect(header().querySelector('.delta-header')).toBeTruthy();
    expect(header().querySelector('.effects-header')).toBeFalsy();

    // Enable CLES too — both show.
    await user.click(screen.getByRole('option', { name: 'CLES' }));
    expect(header().querySelector('.delta-header')).toBeTruthy();
    expect(header().querySelector('.effects-header')).toBeTruthy();

    // Turn Cliff's Delta back off — only CLES remains.
    await user.click(screen.getByRole('option', { name: "Cliff's Delta" }));
    expect(header().querySelector('.delta-header')).toBeFalsy();
    expect(header().querySelector('.effects-header')).toBeTruthy();
  });

  it('shows the advanced columns named in the advanced_columns URL param', async () => {
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(
      testCompareMannWhitneyData,
      'test_version=mann-whitney-u&advanced_columns=cliffs_delta',
    );
    await screen.findByText('a11yr');

    const header = screen.getByTestId('table-header');
    expect(header.querySelector('.delta-header')).toBeTruthy();
    expect(header.querySelector('.effects-header')).toBeFalsy();
  });

  it('persists the advanced-column selection to the advanced_columns URL param', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    const advancedParam = () =>
      new URLSearchParams(window.location.search).get('advanced_columns');
    expect(advancedParam()).toBeNull();

    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );
    await user.click(screen.getByRole('option', { name: "Cliff's Delta" }));
    expect(advancedParam()).toBe('cliffs_delta');

    await user.click(screen.getByRole('option', { name: 'CLES' }));
    expect(advancedParam()).toBe('cliffs_delta,cles');

    // Turning a column off updates the param; turning the last one off removes it.
    await user.click(screen.getByRole('option', { name: "Cliff's Delta" }));
    expect(advancedParam()).toBe('cles');

    await user.click(screen.getByRole('option', { name: 'CLES' }));
    expect(advancedParam()).toBeNull();
  });

  it('groups the dropdown into Advanced Columns and Advanced expanded row details sections', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );

    // Both group headers and one option from each group are present.
    expect(screen.getByText('Advanced Columns')).toBeInTheDocument();
    expect(
      screen.getByText('Advanced expanded row details'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: "Cliff's Delta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Statistics table' }),
    ).toBeInTheDocument();
  });

  it('seeds the expanded-row selection from the advanced_expanded URL param', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(
      testCompareMannWhitneyData,
      'test_version=mann-whitney-u&advanced_expanded=stats_table',
    );
    await screen.findByText('a11yr');

    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );

    // The seeded option is checked; an unseeded one is not.
    expect(
      screen.getByRole('option', { name: 'Statistics table' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', { name: 'Data warnings' }),
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('persists the expanded-row selection to the advanced_expanded URL param', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    const expandedParam = () =>
      new URLSearchParams(window.location.search).get('advanced_expanded');
    expect(expandedParam()).toBeNull();

    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );
    await user.click(screen.getByRole('option', { name: 'Statistics table' }));
    expect(expandedParam()).toBe('stats_table');

    await user.click(screen.getByRole('option', { name: 'Data warnings' }));
    expect(expandedParam()).toBe('stats_table,warnings');

    // Turning the columns off leaves the expanded-row param untouched.
    await user.click(screen.getByRole('option', { name: 'Statistics table' }));
    expect(expandedParam()).toBe('warnings');

    await user.click(screen.getByRole('option', { name: 'Data warnings' }));
    expect(expandedParam()).toBeNull();
  });

  it('shows a confirmation toast when an expanded-row option is toggled', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData } = getTestData();
    setupAndRender(testCompareMannWhitneyData, 'test_version=mann-whitney-u');
    await screen.findByText('a11yr');

    await user.click(
      screen.getByRole('combobox', { name: 'Advanced options' }),
    );
    await user.click(screen.getByRole('option', { name: 'Statistics table' }));
    expect(
      await screen.findByText(/Statistics table added to the expanded rows/i),
    ).toBeInTheDocument();

    // Turning it back off toasts the removal.
    await user.click(screen.getByRole('option', { name: 'Statistics table' }));
    expect(
      await screen.findByText(
        /Statistics table removed from the expanded rows/i,
      ),
    ).toBeInTheDocument();
  });
});

describe('cookie persistence vs. shareable URLs', () => {
  it('seeds filters from cookies and marks the URL initialized on a fresh URL', async () => {
    document.cookie = 'perfcompare_filter_status=regression; path=/';
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t');

    await screen.findByText('a11yr');

    // The remembered cookie is applied to the view...
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
    ]);
    // ...and materialised into the URL, which is now marked initialized so the
    // link reproduces this exact view for anyone.
    expect(summarizeTableFiltersFromUrl()).toEqual({ status: ['regression'] });
    expect(new URLSearchParams(window.location.search).get('initialized')).toBe(
      '1',
    );
  });

  it('ignores cookies when the URL is already initialized', async () => {
    // A different viewer's cookie must not change what an initialized (shared)
    // URL displays.
    document.cookie = 'perfcompare_filter_status=regression; path=/';
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t&initialized=1');

    await screen.findByText('a11yr');

    // Cookie is ignored: every status stays visible.
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux 18.04, Regression, 1.85 %, Medium',
      '  - macOS 10.15, Improvement, 1.08 %, Low',
      '  - Windows 10, -, -24 %, -',
      '  - Windows 10, -, -2.4 %, High',
    ]);
    // ...and the cookie is not written into the URL.
    expect(summarizeTableFiltersFromUrl()).toEqual({});
  });

  it('keeps the initialized marker after toggling a filter', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t');

    await screen.findByText('a11yr');

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    await clickMenuItem(user, 'Status', /No changes/);

    expect(summarizeTableFiltersFromUrl()).toEqual({
      status: ['improvement', 'regression'],
    });
    expect(new URLSearchParams(window.location.search).get('initialized')).toBe(
      '1',
    );
  });

  it('keeps the initialized marker and seeded filters after a search-term change', async () => {
    document.cookie = 'perfcompare_filter_status=regression; path=/';
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t');

    await screen.findByText('a11yr');

    // Seeded from the cookie and marked initialized.
    expect(summarizeTableFiltersFromUrl()).toEqual({ status: ['regression'] });
    expect(new URLSearchParams(window.location.search).get('initialized')).toBe(
      '1',
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    // Submit with Enter so the write happens immediately (bypasses the input's
    // debounce, which fake timers don't flush after typing).
    await user.type(
      screen.getByPlaceholderText('Filter results'),
      'linux{Enter}',
    );

    // The search term is written, and the out-of-band params survive.
    const params = new URLSearchParams(window.location.search);
    expect(params.get('search')).toBe('linux');
    expect(params.get('initialized')).toBe('1');
    expect(params.get('filter_status')).toBe('regression');
  });

  it('keeps the initialized marker and seeded filters after a test-version change', async () => {
    document.cookie = 'perfcompare_filter_status=regression; path=/';
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData, 'test_version=student-t');

    await screen.findByText('a11yr');
    expect(new URLSearchParams(window.location.search).get('initialized')).toBe(
      '1',
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(
      screen.getByRole('combobox', { name: 'Stats Test Version' }),
    );
    await user.click(
      await screen.findByRole('option', { name: 'Mann-Whitney-U' }),
    );

    // The test version changes (a router navigation), and the marker + seeded
    // filter ride along instead of being dropped.
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('test_version')).toBe('mann-whitney-u');
      expect(params.get('initialized')).toBe('1');
      expect(params.get('filter_status')).toBe('regression');
    });
  });
});
