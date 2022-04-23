import store from '../common/store';
import {
  updateSearchIsFocused,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} from '../reducers/SearchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const searchViewHelper = {
  searchByRevisionOrEmail(repository, search) {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    if (emailMatch.test(search)) {
      store.dispatch(fetchRevisionsByAuthor({ repository, search }));
    } else if (longHashMatch.test(search) || shortHashMatch.test(search)) {
      store.dispatch(fetchRevisionByID({ repository, search }));
    }
  },

  handleChangeDropdown(event) {
    const repository = event.target.id;
    const search = store.getState().search.searchValue;

    // Update state with selected repository
    store.dispatch(updateRepository(repository));
    // If repository is selected after search value is input, fetch search results
    if (search !== '') {
      searchViewHelper.searchByRevisionOrEmail(repository, search);
    } else {
      // Fetch 10 most recent revisions when repository changes
      store.dispatch(fetchRecentRevisions(repository));
    }
    store.dispatch(updateSearchIsFocused(true));
  },

  handleChangeSearch(event) {
    const search = event.target.value;
    const { repository } = store.getState().search;
    store.dispatch(updateSearchValue(search));

    // If search input is cleared, clear results
    if (search === '') store.dispatch(updateSearchResults([]));

    if (repository === '') {
      console.log('Please select a repository');
    } else {
      searchViewHelper.searchByRevisionOrEmail(repository, search);
    }
  },

  handleClickOutsideInput(event) {
    if (
      event.target.matches(
        '#search-revision-input, .search-revision, .search-revision *',
      )
    ) {
      store.dispatch(updateSearchIsFocused(true));
    } else {
      store.dispatch(updateSearchIsFocused(false));
    }
  },
};

export default searchViewHelper;
