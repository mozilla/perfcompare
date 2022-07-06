import { axe, toHaveNoViolations } from 'jest-axe';

import CompareResultsView from '../../components/CompareResults/CompareResultsView';
import SearchDropdown from '../../components/Search/SearchDropdown';
import SearchResultsList from '../../components/Search/SearchResultsList';
import SearchView from '../../components/Search/SearchView';
import SelectedRevisionsTable from '../../components/Shared/SelectedRevisionsTable';
import { updateSearchResults } from '../../reducers/SearchSlice';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it('SearchInput should have no violations', async () => {
    const { container } = renderWithRouter(<SearchView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SearchResultsList should have no violations', async () => {
    const { testData } = getTestData();

    const { container } = renderWithRouter(
      <SearchResultsList view="search" searchResults={testData} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SearchDropdown should have no violations', async () => {
    const { testData } = getTestData();
    store.dispatch(updateSearchResults(testData));

    const { container } = renderWithRouter(<SearchDropdown />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SelectedRevisionsTable should have no violations', async () => {
    const { testData } = getTestData();
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    const { container } = renderWithRouter(
      <SelectedRevisionsTable view="search" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CompareResultsView should have no violations', async () => {
    const { testData } = getTestData();
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    const { container } = renderWithRouter(<CompareResultsView mode="light" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
