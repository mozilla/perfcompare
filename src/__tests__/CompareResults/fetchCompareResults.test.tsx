import type { ReactElement } from 'react';

import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  renderHook,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route:
      '/compare-results/?revs=6089e7f0fa57a29c6d080f135f65e146c34457d8,1d5eb1343cc87a9be3dfe4b884822506ffdda7d3&repos=mozilla-central,mozilla-central&framework=1',
  });
}

describe('Results View/fetchCompareResults', () => {
  it('Should fetch and display recent results', async () => {
    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
      .toggleColorMode;

    const expectedUrl =
      'https://treeherder.mozilla.org/api/perfcompare/results/?base_repository=mozilla-central&base_revision=6089e7f0fa57a29c6d080f135f65e146c34457d8&new_repository=mozilla-central&new_revision=1d5eb1343cc87a9be3dfe4b884822506ffdda7d3&framework=1&interval=86400&no_subtests=true';

    const { testCompareData, testData } = getTestData();
    (global.fetch as FetchMockSandbox)
      .get(expectedUrl, testCompareData)
      .get(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/',
        { results: testData },
      );

    renderWithRoute(
      <ResultsView
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(global.fetch).toHaveBeenCalledWith(expectedUrl, undefined);
    expect(await screen.findByText('a11yr')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('State does not contain data if fetch returns no results', async () => {
    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
      .toggleColorMode;

    // There's no performance tests, but there are revisions.
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox)
      .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: testData,
      });

    renderWithRoute(
      <ResultsView
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
