import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Search by title/test name', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<ResultsView />);

    expect(screen.getByTestId('search-by-title-test-name')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
