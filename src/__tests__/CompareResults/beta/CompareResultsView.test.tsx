import CompareResultsViewBeta from '../../../components/CompareResults/beta/CompareResultsView';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('CompareResults View', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<CompareResultsViewBeta />);

    expect(screen.getByTestId('beta-version-compare-results')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
