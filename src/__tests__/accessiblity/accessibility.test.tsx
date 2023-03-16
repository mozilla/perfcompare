import { axe, toHaveNoViolations } from 'jest-axe';
import { act } from 'react-dom/test-utils';

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
    await act(async () => {
      const { container } = renderWithRouter(<SearchView />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
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

    const { container } = renderWithRouter(<SearchDropdown view="search" />);
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

  it('CompareResultsView should have no violations in light mode', async () => {
    const { testData } = getTestData();
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    const { container } = renderWithRouter(<CompareResultsView mode="light" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // TO DO: resolve 'Axe is already running' issue and re-enable test
  // https://github.com/mozilla/perfcompare/issues/222
  // it('CompareResultsView should have no violations in dark mode', async () => {
  //   const { testData } = getTestData();
  //   const selectedRevisions = testData.slice(0, 4);
  //   store.dispatch(setSelectedRevisions(selectedRevisions));

  //   const { container } = renderWithRouter(<CompareResultsView mode="dark" />);
  //   const results = await axe(container);
  //   expect(results).toHaveNoViolations();
  // });
});
