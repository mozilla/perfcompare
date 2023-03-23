import CompareResultsViewBeta from '../../../components/CompareResults/beta/CompareResultsView';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Search by title/test name', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<CompareResultsViewBeta />);

    expect(screen.getByTestId('search-by-title-test-name')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
