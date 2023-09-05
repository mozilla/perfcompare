import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import { Strings } from '../../../resources/Strings';
import useProtocolTheme from '../../../theme/protocolTheme';
import getTestData from '../../utils/fixtures';
import { renderWithRouter, store } from '../../utils/setupTests';
import { renderHook } from '../../utils/test-utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useLocation: () => ({
    search:
      '?revs=6089e7f0fa57a29c6d080f135f65e146c34457d8,1d5eb1343cc87a9be3dfe4b884822506ffdda7d3&repos=mozilla-central,mozilla-central&framework=1',
  }),
}));

describe('Results View/fetchCompareResults', () => {
  it('Should fetch and display recent results', () => {
    const protocolTheme = renderHook(() => useProtocolTheme()).result.current
      .protocolTheme;
    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
      .toggleColorMode;

    const { testCompareData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testCompareData,
        }),
      }),
    ) as jest.Mock;

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/perfcompare/results/?base_repository=mozilla-central&base_revision=6089e7f0fa57a29c6d080f135f65e146c34457d8&new_repository=mozilla-central&new_revision=1d5eb1343cc87a9be3dfe4b884822506ffdda7d3&framework=1&interval=86400&no_subtests=true',
    );
    expect(document.body).toMatchSnapshot();
  });

  it('State does not contain data if fetch returns no results', () => {
    const protocolTheme = renderHook(() => useProtocolTheme()).result.current
      .protocolTheme;
    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
      .toggleColorMode;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    ) as jest.Mock;

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/perfcompare/results/?base_repository=mozilla-central&base_revision=6089e7f0fa57a29c6d080f135f65e146c34457d8&new_repository=mozilla-central&new_revision=1d5eb1343cc87a9be3dfe4b884822506ffdda7d3&framework=1&interval=86400&no_subtests=true',
    );
    expect(store.getState().compareResults.data).toStrictEqual({});
    expect(document.body).toMatchSnapshot();
  });
});
