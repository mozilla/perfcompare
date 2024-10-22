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

      const revisionGroups = Array.from(group.children).slice(
        1,
      ) as HTMLElement[];

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
      '  - OSX, Improvement, Low',
      '  rev: devilrabbit',
      '  - OSX, Improvement, Low',
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
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
      '  - Android, Improvement, Low',
    ]);

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Platform/, /Windows/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Android, Improvement, Low',
    ]);

    await clickMenuItem(user, /Platform/, /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Android, Improvement, Low',
    ]);
    await clickMenuItem(user, /Platform/, /Linux/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Android, Improvement, Low',
    ]);

    await clickMenuItem(user, /Platform/, 'Clear filters');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
      '  - Android, Improvement, Low',
    ]);

    await clickMenuItem(user, /Platform/, /OSX/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
      '  - Android, Improvement, Low',
    ]);

    await clickMenuItem(user, /Platform/, /Android/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);
  });

  it('should filter on the Status column', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Status/, /No changes/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
    ]);

    await clickMenuItem(user, /Status/, /Clear filters/);
    await clickMenuItem(user, /Status/, /Improvement/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);
    await clickMenuItem(user, /Status/, /Regression/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);
  });

  it('should filter on the Confidence column', async () => {
    const { testCompareData } = getTestData();
    setupAndRender(testCompareData);

    await screen.findByText('a11yr');
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);

    const user = userEvent.setup({ delay: null });
    await clickMenuItem(user, /Confidence/, /Low/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);

    await clickMenuItem(user, /Confidence/, /High/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Linux, Regression, Medium',
      '  - Windows, -, ',
    ]);

    await clickMenuItem(user, /Confidence/, /Medium/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - Windows, -, ',
    ]);

    await clickMenuItem(user, /Confidence/, /Clear filters/);
    expect(summarizeVisibleRows()).toEqual([
      'a11yr dhtml.html spam opt e10s fission stylo webrender',
      '  - OSX, Improvement, Low',
      '  - Linux, Regression, Medium',
      '  - Windows, -, High',
      '  - Windows, -, ',
    ]);
  });
});
