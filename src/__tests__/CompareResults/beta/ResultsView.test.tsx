import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Results View', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<ResultsView />);

    expect(screen.getByTestId('beta-version-compare-results')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
