import type { ReactElement } from 'react';

import ResultsTable from '../../components/CompareResults/ResultsTable';
import { renderWithRouter, screen } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/?fakedata=true',
  });
}

describe('Results Table', () => {
  it('Should match snapshot', () => {
    renderWithRoute(<ResultsTable />);

    expect(screen.getByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Display message for not finding results', () => {
    renderWithRoute(<ResultsTable />);

    expect(screen.getByText(/No results found/)).toBeInTheDocument();
  });
});
