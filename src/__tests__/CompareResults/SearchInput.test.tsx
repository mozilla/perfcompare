import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import { renderWithRouter, screen } from '../utils/test-utils';

describe('Search by title/test name', () => {
  it('Should match snapshot', () => {
    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );

    expect(screen.getByTestId('search-by-title-test-name')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
