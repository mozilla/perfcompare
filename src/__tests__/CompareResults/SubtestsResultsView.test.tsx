import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/subtestsLoader';
import { loader as subtestsOverTimeLoader } from '../../components/CompareResults/subtestsOverTimeLoader';
import SubtestsOverTimeResultsView from '../../components/CompareResults/SubtestsResults/SubtestsOverTimeResultsView';
import SubtestsResultsView from '../../components/CompareResults/SubtestsResults/SubtestsResultsView';
import { Strings } from '../../resources/Strings';
import type { CombinedResultsItemType } from '../../types/state';
import { TestVersion } from '../../types/types';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import { renderWithRouter, screen } from '../utils/test-utils';

jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;

const setup = ({
  element,
  route,
  search,
  subtestsResult,
}: {
  element: React.ReactElement;
  route: string;
  search: string;
  subtestsResult: CombinedResultsItemType[];
}): void => {
  // Mock fetch data
  fetchMock.get(
    'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
    subtestsResult,
  );

  // Check if the route indicates an "over time" comparison
  const isOverTimeComparison = route.includes(
    'subtests-compare-over-time-results',
  );

  // Render the component with routing
  renderWithRouter(element, {
    route,
    search,
    loader: isOverTimeComparison ? subtestsOverTimeLoader : loader,
  });
};

// This handy function parses the results page and returns an array of visible
// rows. It makes it easy to assert visible rows when filtering them in a
// user-friendly way without using snapshots.
function summarizeVisibleRows(testVersion?: TestVersion) {
  const rows = screen.getAllByRole('row');
  const result = [];
  for (const row of rows) {
    const subtest = row.querySelector('.subtests')?.textContent;
    if (!subtest) {
      continue;
    }
    const rowClasses =
      testVersion === 'mann-whitney-u'
        ? ['.delta', '.significance', '.effects']
        : ['.delta', '.confidence'];
    const rowString = rowClasses
      .map((selector) => row.querySelector(selector)?.textContent.trim())
      .join(', ');
    result.push(`${subtest}: ${rowString}`);
  }
  return result;
}

function expectParameterToHaveValue(parameter: string, expectedValue: string) {
  const searchParams = new URLSearchParams(window.location.search);
  const currentValue = searchParams.get(parameter);
  expect(currentValue).toEqual(expectedValue);
}

describe('SubtestsResultsView Component Tests', () => {
  it('should render the subtests results view and match snapshot', async () => {
    const { subtestsResult } = getTestData();
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
      subtestsResult,
    });

    await screen.findByText('dhtml.html');
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.findByText('All results')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('should render the subtests results view with mann-whitney-u testVersions in url', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsMannWhitneyResult } = getTestData();
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    const expandRowButton = await screen.findAllByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton[0]);
    expect(
      await screen.findByText(/Goodness of Fit Test/i),
    ).toBeInTheDocument();

    await user.click(expandRowButton[1]);
    const openedSubtests = await screen.findAllByText(/Normality Test/i);
    expect(openedSubtests).toHaveLength(2);
  });

  it('should request authorization code when "Retrigger" button is clicked', async () => {
    const { subtestsResult } = getTestData();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.spyOn(window, 'alert').mockImplementation();
    const mockedWindowAlert = window.alert as jest.Mock;
    jest.spyOn(window, 'open').mockImplementation();
    const mockedWindowOpen = window.open as jest.Mock;

    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
      subtestsResult,
    });

    const retriggerButton = await screen.findByRole('button', {
      name: 'Retrigger test',
    });

    // Test no clientId configured should alert
    mockedGetLocationOrigin.mockImplementation(() => 'http://test.com');
    await user.click(retriggerButton);
    expect(mockedWindowAlert).toHaveBeenCalledWith(
      'No clientId is configured for origin http://test.com, sorry!',
    );

    // Test requesting an authorization code from Taskcluster production URL
    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');
    await user.click(retriggerButton);
    await user.click(await screen.findByRole('button', { name: /Sign in/ }));

    let windowOpenUrlString = mockedWindowOpen.mock.lastCall[0] as string;
    let windowOpenUrl = new URL(windowOpenUrlString);
    expect(sessionStorage.requestState).toBe(
      windowOpenUrl.searchParams.get('state'),
    );
    expect(sessionStorage.taskclusterUrl).toBe(windowOpenUrl.origin);

    // Test requesting an authorization code from Taskcluster staging URL
    window.location.hash = 'taskcluster-staging';
    await user.click(retriggerButton);
    windowOpenUrlString = mockedWindowOpen.mock.lastCall[0] as string;
    windowOpenUrl = new URL(windowOpenUrlString);
    expect(sessionStorage.requestState).toBe(
      windowOpenUrl.searchParams.get('state'),
    );
    expect(sessionStorage.taskclusterUrl).toBe(windowOpenUrl.origin);
  });

  it('should make blobUrl available when "Download JSON" button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const createObjectURLMock = jest.fn().mockReturnValue('blob:');
    global.URL.createObjectURL = createObjectURLMock;
    const revokeObjectURLMock = jest.fn();
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Render the component
    const { subtestsResult } = getTestData();
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
      subtestsResult,
    });

    const button = await screen.findByText('Download JSON');
    await user.click(button);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:');
  });

  it('Display message for not finding results', async () => {
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
      subtestsResult: [],
    });
    expect(await screen.findByText(/No results found/)).toBeInTheDocument();
  });

  describe('table sorting', () => {
    async function setupForSorting({
      extraParameters,
    }: Partial<{
      extraParameters: string;
    }> = {}) {
      let searchParameters =
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487';
      if (extraParameters) {
        searchParameters += '&' + extraParameters;
      }

      // Render the component
      const { subtestsResult } = getTestData();
      setup({
        element: (
          <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
        ),
        route: '/subtests-compare-results/',
        search: searchParameters,
        subtestsResult,
      });
      await screen.findByText('dhtml.html');
    }

    it('can sort the table and persist the information to the URL', async () => {
      await setupForSorting();
      // Initial view (alphabetical ordered, even if "sort by subtests" isn't specified
      expect(summarizeVisibleRows()).toEqual([
        'browser.html: -1.43 %, Low',
        'dhtml.html: 1.14 %, Low',
        'improvement.html: -1.44 %, Low',
        'regression.html: 1.04 %, High',
        'tablemutation.html: 0.98 %, Low',
      ]);

      // Sort by Delta
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const deltaButton = screen.getByRole('button', { name: /Delta/ });
      expect(deltaButton).toMatchSnapshot();
      expect(window.location.search).not.toContain('sort=');
      // Sort descending
      await user.click(deltaButton);
      expect(summarizeVisibleRows()).toEqual([
        'improvement.html: -1.44 %, Low',
        'browser.html: -1.43 %, Low',
        'dhtml.html: 1.14 %, Low',
        'regression.html: 1.04 %, High',
        'tablemutation.html: 0.98 %, Low',
      ]);
      // It should have the "descending" SVG.
      expect(deltaButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'delta|desc');

      // Sort ascending
      await user.click(deltaButton);
      expect(summarizeVisibleRows()).toEqual([
        'tablemutation.html: 0.98 %, Low',
        'regression.html: 1.04 %, High',
        'dhtml.html: 1.14 %, Low',
        'browser.html: -1.43 %, Low',
        'improvement.html: -1.44 %, Low',
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
        'regression.html: 1.04 %, High',
        'improvement.html: -1.44 %, Low',
        'browser.html: -1.43 %, Low',
        'dhtml.html: 1.14 %, Low',
        'tablemutation.html: 0.98 %, Low',
      ]);
      // It should have the "no sort" SVG.
      expect(deltaButton).toMatchSnapshot();
      // It should have the "descending" SVG.
      expect(confidenceButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'confidence|desc');

      // Sort by subtest name descending
      const subtestsButton = screen.getByRole('button', { name: /Subtests/ });
      await user.click(subtestsButton);
      expect(summarizeVisibleRows()).toEqual([
        'tablemutation.html: 0.98 %, Low',
        'regression.html: 1.04 %, High',
        'improvement.html: -1.44 %, Low',
        'dhtml.html: 1.14 %, Low',
        'browser.html: -1.43 %, Low',
      ]);
      // It should have the "no sort" SVG.
      expect(confidenceButton).toMatchSnapshot();
      // It should have the "descending" SVG.
      expect(subtestsButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'subtests|desc');

      // Clicking twice more should reset the URL.
      await user.click(subtestsButton);
      await user.click(subtestsButton);
      expect(window.location.search).not.toContain('sort=');
    });

    it('initializes the sort from the URL at load time for an ascending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta|asc' });
      await screen.findByText('dhtml.html');
      expect(summarizeVisibleRows()).toEqual([
        'tablemutation.html: 0.98 %, Low',
        'regression.html: 1.04 %, High',
        'dhtml.html: 1.14 %, Low',
        'browser.html: -1.43 %, Low',
        'improvement.html: -1.44 %, Low',
      ]);
      // It should have the "ascending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });

    it('initializes the sort from the URL at load time for an implicit descending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta' });
      await screen.findByText('dhtml.html');
      expect(summarizeVisibleRows()).toEqual([
        'improvement.html: -1.44 %, Low',
        'browser.html: -1.43 %, Low',
        'dhtml.html: 1.14 %, Low',
        'regression.html: 1.04 %, High',
        'tablemutation.html: 0.98 %, Low',
      ]);
      // It should have the "descending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });

    it('initializes the sort from the URL at load time for a descending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta|desc' });
      expect(summarizeVisibleRows()).toEqual([
        'improvement.html: -1.44 %, Low',
        'browser.html: -1.43 %, Low',
        'dhtml.html: 1.14 %, Low',
        'regression.html: 1.04 %, High',
        'tablemutation.html: 0.98 %, Low',
      ]);
      // It should have the "descending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });
  });
});

describe('SubtestsViewCompareOverTime Component Tests', () => {
  it('should render the subtests over time results view and match snapshot', async () => {
    const { subtestsResult } = getTestData();
    setup({
      element: (
        <SubtestsOverTimeResultsView
          title={Strings.metaData.pageTitle.subtests}
        />
      ),
      route: '/subtests-compare-over-time-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&selectedTimeRange=86400&baseParentSignature=4774487&newParentSignature=4774487',
      subtestsResult,
    });

    await screen.findByText('dhtml.html');
    expect(document.body).toMatchSnapshot();
  });

  it('renders correctly when backend returns MannWhitneyResultsItem[] for mann-whitney-u test_version', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsMannWhitneyResult } = getTestData();

    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    // Expand first row to expose mann-whitney details
    const expandRowButton = await screen.findAllByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton[0]);

    expect(
      await screen.findByText(/Goodness of Fit Test/i),
    ).toBeInTheDocument();
  });

  it('renders over-time view when backend returns MannWhitneyResultsItem[]', async () => {
    const { subtestsMannWhitneyResult } = getTestData();

    setup({
      element: (
        <SubtestsOverTimeResultsView
          title={Strings.metaData.pageTitle.subtests}
        />
      ),
      route: '/subtests-compare-over-time-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&selectedTimeRange=86400&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    await screen.findByText('dhtml.html');
    expect(document.body).toMatchSnapshot();
  });
});

describe('SubtestsResultsView Component Tests for mann-whitney-u testVersion', () => {
  it('should render the subtests results view with mann-whitney-u testVersions in url', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsMannWhitneyResult } = getTestData();
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    const expandRowButton = await screen.findAllByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton[0]);
    expect(
      await screen.findByText(/Goodness of Fit Test/i),
    ).toBeInTheDocument();

    await user.click(expandRowButton[1]);
    const openedSubtests = await screen.findAllByText(/Normality Test/i);
    expect(openedSubtests).toHaveLength(2);
  });

  it('should make blobUrl available when "Download JSON" button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const createObjectURLMock = jest.fn().mockReturnValue('blob:');
    global.URL.createObjectURL = createObjectURLMock;
    const revokeObjectURLMock = jest.fn();
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Render the component
    const { subtestsMannWhitneyResult } = getTestData();
    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    const button = await screen.findByText('Download JSON');
    await user.click(button);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:');
  });

  describe('table sorting', () => {
    async function setupForSorting({
      extraParameters,
    }: Partial<{
      extraParameters: string;
    }> = {}) {
      let searchParameters =
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u';
      if (extraParameters) {
        searchParameters += '&' + extraParameters;
      }

      // Render the component
      const { subtestsMannWhitneyResult } = getTestData();
      setup({
        element: (
          <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
        ),
        route: '/subtests-compare-results/',
        search: searchParameters,
        subtestsResult: subtestsMannWhitneyResult,
      });
      await screen.findByText('dhtml.html');
    }

    it('can sort the table and persist the information to the URL of mann-whitney-u values', async () => {
      await setupForSorting();
      // Initial view (alphabetical ordered, even if "sort by subtests" isn't specified
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'browser.html: -0.04, not significant, 15.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'regression.html: 0.12, significant, 25.00%',
        'tablemutation.html: 0.01, -, 45.00%',
      ]);

      // Sort by Delta
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const deltaButton = screen.getByRole('button', { name: /Delta/ });
      expect(deltaButton).toMatchSnapshot();
      expect(window.location.search).not.toContain('sort=');
      // Sort descending
      await user.click(deltaButton);
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'regression.html: 0.12, significant, 25.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'browser.html: -0.04, not significant, 15.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'tablemutation.html: 0.01, -, 45.00%',
      ]);

      // It should have the "descending" SVG.
      expect(deltaButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'delta|desc');

      // Sort ascending
      await user.click(deltaButton);
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'tablemutation.html: 0.01, -, 45.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'browser.html: -0.04, not significant, 15.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'regression.html: 0.12, significant, 25.00%',
      ]);
      // It should have the "ascending" SVG.
      expect(deltaButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'delta|asc');

      // Sort by Significance descending
      const significanceButton = screen.getByRole('button', {
        name: /Significance.*sort/,
      });
      await user.click(significanceButton);
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'browser.html: -0.04, not significant, 15.00%',
        'tablemutation.html: 0.01, -, 45.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'regression.html: 0.12, significant, 25.00%',
        'improvement.html: -0.05, significant, 50.00%',
      ]);
      // It should have the "no sort" SVG.
      expect(deltaButton).toMatchSnapshot();
      // It should have the "descending" SVG.
      expect(significanceButton).toMatchSnapshot();
      // It should be persisted in the URL
      expectParameterToHaveValue('sort', 'significance|desc');

      // Sort by Significance ascending
      await user.click(significanceButton);
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'improvement.html: -0.05, significant, 50.00%',
        'regression.html: 0.12, significant, 25.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'tablemutation.html: 0.01, -, 45.00%',
        'browser.html: -0.04, not significant, 15.00%',
      ]);
      expectParameterToHaveValue('sort', 'significance|asc');
    });

    it('initializes the sort from the URL at load time for an ascending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta|asc' });
      await screen.findByText('dhtml.html');
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'tablemutation.html: 0.01, -, 45.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'browser.html: -0.04, not significant, 15.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'regression.html: 0.12, significant, 25.00%',
      ]);
      // It should have the "ascending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });

    it('initializes the sort from the URL at load time for an implicit descending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta' });
      await screen.findByText('dhtml.html');
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'regression.html: 0.12, significant, 25.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'browser.html: -0.04, not significant, 15.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'tablemutation.html: 0.01, -, 45.00%',
      ]);
      // It should have the "descending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });

    it('initializes the sort from the URL at load time for a descending sort', async () => {
      await setupForSorting({ extraParameters: 'sort=delta|desc' });
      expect(summarizeVisibleRows('mann-whitney-u')).toEqual([
        'regression.html: 0.12, significant, 25.00%',
        'improvement.html: -0.05, significant, 50.00%',
        'browser.html: -0.04, not significant, 15.00%',
        'dhtml.html: 0.02, significant, 60.00%',
        'tablemutation.html: 0.01, -, 45.00%',
      ]);
      // It should have the "descending" SVG.
      expect(screen.getByRole('button', { name: /Delta/ })).toMatchSnapshot();
    });
  });
});

describe('SubtestsViewCompareOverTime Component Tests in mann-whitney-u testVersion', () => {
  it('should render the subtests over time results view and match snapshot', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    setup({
      element: (
        <SubtestsOverTimeResultsView
          title={Strings.metaData.pageTitle.subtests}
        />
      ),
      route: '/subtests-compare-over-time-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&selectedTimeRange=86400&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    await screen.findByText('dhtml.html');
    expect(document.body).toMatchSnapshot();
  });

  it('renders correctly when backend returns MannWhitneyResultsItem[] for mann-whitney-u test_version', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsMannWhitneyResult } = getTestData();

    setup({
      element: (
        <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
      ),
      route: '/subtests-compare-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    // Expand first row to expose mann-whitney details
    const expandRowButton = await screen.findAllByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton[0]);

    expect(
      await screen.findByText(/Goodness of Fit Test/i),
    ).toBeInTheDocument();
  });

  it('renders over-time view when backend returns MannWhitneyResultsItem[]', async () => {
    const { subtestsMannWhitneyResult } = getTestData();

    setup({
      element: (
        <SubtestsOverTimeResultsView
          title={Strings.metaData.pageTitle.subtests}
        />
      ),
      route: '/subtests-compare-over-time-results/',
      search:
        '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&selectedTimeRange=86400&baseParentSignature=4774487&newParentSignature=4774487&test_version=mann-whitney-u',
      subtestsResult: subtestsMannWhitneyResult,
    });

    await screen.findByText('dhtml.html');
    expect(document.body).toMatchSnapshot();
  });
});
