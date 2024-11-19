import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/subtestsLoader';
import SubtestsOverTimeResultsView from '../../components/CompareResults/SubtestsResults/SubtestsOverTimeResultsView';
import SubtestsResultsMain from '../../components/CompareResults/SubtestsResults/SubtestsResultsMain';
import SubtestsResultsView from '../../components/CompareResults/SubtestsResults/SubtestsResultsView';
import { Strings } from '../../resources/Strings';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  FetchMockSandbox,
} from '../utils/test-utils';

jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;

describe('SubtestsResultsView Component Tests', () => {
  it('should render the subtests results view and match snapshot', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(
      <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />,
      {
        route: '/subtests-compare-results/',
        search:
          '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
        loader,
      },
    );

    expect(
      await screen.findByTestId('beta-version-compare-subtests-results'),
    ).toMatchSnapshot();
  });

  it('should confirm the presence of main content in the view', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(<SubtestsResultsMain view={'subtests-results'} />, {
      route: '/subtestsCompareWithBase',
      search:
        '?baseRev=d775409d7c6abb76362a3430e9880ec032ad4679&baseRepo=mozilla-central&newRev=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&newRepo=mozilla-central&framework=1&baseParentSignature=4769486&newParentSignature=4769486',
      loader,
    });

    const subTestsMain = await screen.findByTestId('subtests-main');

    expect(subTestsMain).toBeInTheDocument();
  });

  it('should confirm that the subtests heading is present', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(<SubtestsResultsMain view={'subtests-results'} />, {
      route: '/subtestsCompareWithBase',
      search:
        '?baseRev=d775409d7c6abb76362a3430e9880ec032ad4679&baseRepo=mozilla-central&newRev=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&newRepo=mozilla-central&framework=1&baseParentSignature=4769486&newParentSignature=4769486',
      loader,
    });

    const subTestsHeading = await screen.findByText('Subtests');

    expect(subTestsHeading).toBeInTheDocument();
  });

  it('should display breadcrumbs for easy navigation', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(<SubtestsResultsMain view={'subtests-results'} />, {
      route: '/subtestsCompareWithBase',
      search:
        '?baseRev=d775409d7c6abb76362a3430e9880ec032ad4679&baseRepo=mozilla-central&newRev=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&newRepo=mozilla-central&framework=1&baseParentSignature=4769486&newParentSignature=4769486',
      loader,
    });

    const homeBreadcrumb = await screen.findByText('Home');
    const resultsBreadcrumb = await screen.findByText('All results');

    expect(homeBreadcrumb).toBeInTheDocument();
    expect(resultsBreadcrumb).toBeInTheDocument();
  });

  it('should confirm that the subtests results table is displayed', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(<SubtestsResultsMain view={'subtests-results'} />, {
      route: '/subtestsCompareWithBase',
      search:
        '?baseRev=d775409d7c6abb76362a3430e9880ec032ad4679&baseRepo=mozilla-central&newRev=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&newRepo=mozilla-central&framework=1&baseParentSignature=4769486&newParentSignature=4769486',
      loader,
    });

    const table = await screen.findByTestId('subtests-results-table');

    expect(table).toBeInTheDocument();
  });

  it('should request authorization code when "Retrigger" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );

    jest.spyOn(window, 'alert').mockImplementation();
    const mockedWindowAlert = window.alert as jest.Mock;
    jest.spyOn(window, 'open').mockImplementation();
    const mockedWindowOpen = window.open as jest.Mock;

    renderWithRouter(
      <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />,
      {
        route: '/subtests-compare-results/',
        search:
          '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
        loader,
      },
    );
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
    const user = userEvent.setup({ delay: null });

    const createObjectURLMock = jest.fn().mockReturnValue('blob:');
    global.URL.createObjectURL = createObjectURLMock;
    const revokeObjectURLMock = jest.fn();
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Render the component
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(
      <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />,
      {
        route: '/subtests-compare-results/',
        search:
          '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&baseParentSignature=4774487&newParentSignature=4774487',
        loader,
      },
    );
    const button = await screen.findByText('Download JSON');
    await user.click(button);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:');
  });
});

describe('SubtestsViewCompareOverTime Component Tests', () => {
  it('should render the subtests over time results view and match snapshot', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );
    renderWithRouter(
      <SubtestsOverTimeResultsView
        title={Strings.metaData.pageTitle.subtests}
      />,
      {
        route: '/subtests-compare-over-time-results/',
        search:
          '?baseRev=f49863193c13c1def4db2dd3ea9c5d6bd9d517a7&baseRepo=mozilla-central&newRev=2cb6128d7dca8c9a9266b3505d64d55ac1bcc8a8&newRepo=mozilla-central&framework=1&selectedTimeRange=86400&baseParentSignature=4774487&newParentSignature=4774487',
        loader,
      },
    );

    expect(
      await screen.findByTestId(
        'beta-version-subtests-compare-over-time-results',
      ),
    ).toMatchSnapshot();
  });
});
