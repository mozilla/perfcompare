import ResultsTable from '../../../components/CompareResults/beta/ResultsTable';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Results Table', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<ResultsTable />);

    expect(screen.getByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});