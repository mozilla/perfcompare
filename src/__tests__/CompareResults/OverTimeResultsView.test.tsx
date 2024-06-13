/* eslint-disable jest/no-disabled-tests */
import type { ReactElement } from 'react';

import { loader } from '../../components/CompareResults/overTimeLoader';
import OverTimeResultsView from '../../components/CompareResults/OverTimeResultsView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  const { testCompareData, testData } = getTestData();
  (window.fetch as FetchMockSandbox)
    .get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      testCompareData,
    )
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [testData[0]],
    });

  return renderWithRouter(component, {
    route: '/compare-over-time-results/',
    search:
      '?baseRepo=try&selectedTimeRange=86400&newRev=try&newRepo=try&framework=1',
    loader,
  });
}

jest.mock('../../utils/location');
// const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;

describe('Results View', () => {
  it('The table should match snapshot and other elements should be present in the page', async () => {
    renderWithRoute(
      <OverTimeResultsView title={Strings.metaData.pageTitle.results} />,
    );

    expect(await screen.findByRole('table')).toMatchSnapshot();
    const link = screen.getByRole('link', { name: /link to home/i });
    expect(link).toBeInTheDocument();
  });
});
