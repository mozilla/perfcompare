import type { ReactElement } from 'react';

import { loader } from '../../components/CompareResults/loader';
import ResultsTable from '../../components/CompareResults/ResultsTable';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/',
    search: '?baseRev=spam&baseRepo=try&framework=1',
    loader,
  });
}

describe('Results Table', () => {
  it('Should match snapshot', async () => {
    const { testCompareData } = getTestData();
    (window.fetch as FetchMockSandbox)
      .get(
        'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        testCompareData,
      )
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: [],
      });
    renderWithRoute(<ResultsTable />);

    expect(await screen.findByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Display message for not finding results', async () => {
    (window.fetch as FetchMockSandbox)
      .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: [],
      });
    renderWithRoute(<ResultsTable />);

    expect(await screen.findByText(/No results found/)).toBeInTheDocument();
  });
});
