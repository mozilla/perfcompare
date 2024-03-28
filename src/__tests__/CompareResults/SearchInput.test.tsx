import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import { renderWithRouter, screen } from '../utils/test-utils';

describe('Search by title/test name', () => {
  it('should be present', async () => {
    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
      { loader, search: '?fakedata' },
    );

    // When we'll make it visible again, we'll use something such as getByRole instead.
    expect(
      await screen.findByTestId('search-by-title-test-name'),
    ).toBeInTheDocument();
  });
});
