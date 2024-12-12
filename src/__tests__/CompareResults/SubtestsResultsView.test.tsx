import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/subtestsLoader';
import SubtestsOverTimeResultsView from '../../components/CompareResults/SubtestsResults/SubtestsOverTimeResultsView';
import SubtestsResultsView from '../../components/CompareResults/SubtestsResults/SubtestsResultsView';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  FetchMockSandbox,
} from '../utils/test-utils';

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
  subtestsResult: CompareResultsItem[];
}): void => {
  // Mock fetch data
  (window.fetch as FetchMockSandbox).get(
    'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
    subtestsResult,
  );

  // Render the component with routing
  renderWithRouter(element, {
    route,
    search,
    loader,
  });
};

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

  it('should request authorization code when "Retrigger" button is clicked', async () => {
    const { subtestsResult } = getTestData();
    const user = userEvent.setup({ delay: null });

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
    const user = userEvent.setup({ delay: null });

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
});
