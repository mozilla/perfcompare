import store from '../common/store';
import {
  updateSearchIsFocused,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
  setInputError,
  clearInputError,
} from '../reducers/SearchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

let timeout = null;

const searchViewHelper = {
  searchByRevisionOrEmail(repository, search) {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    if (emailMatch.test(search)) {
      store.dispatch(fetchRevisionsByAuthor({ repository, search }));
    } else if (longHashMatch.test(search) || shortHashMatch.test(search)) {
      store.dispatch(fetchRevisionByID({ repository, search }));
    } else {
      store.dispatch(
        setInputError(
          'Search must be a 12- or 40-character hash, or email address',
        ),
      );
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
    store.dispatch(updateSearchResults([]));
    store.dispatch(clearInputError());

    const idleTime = 500;
    const onTimeout = () => {
      searchViewHelper.searchByRevisionOrEmail(repository, search);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    // If search input is cleared, clear results
    if (search === '') {
      store.dispatch(updateSearchResults([]));
    } else {
      // Submit API call 500ms after user stops typing
      timeout = setTimeout(onTimeout, idleTime);
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
