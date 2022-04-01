import store from '../common/store';
import {
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} from '../reducers/SearchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const SearchViewHelper = {
  searchByRevisionOrEmail(repository, search) {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /[a-zA-Z0-9]{40}/;

    if (emailMatch.test(search)) {
      store.dispatch(fetchRevisionsByAuthor({ repository, search }));
    } else if (longHashMatch.test(search)) {
      store.dispatch(fetchRevisionByID({ repository, search }));
    }
  },

  handleChangeDropdown(event) {
    const repository = event.target.innerText;
    const search = store.getState().search.searchValue;

    // Update state with selected repository
    store.dispatch(updateRepository(repository));
    // If repository is selected after search value is input, fetch search results
    if (search !== '') {
      SearchViewHelper.searchByRevisionOrEmail(repository, search);
    }
    // Fetch 10 most recent revisions when repository changes
    store.dispatch(fetchRecentRevisions(repository));
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
      SearchViewHelper.searchByRevisionOrEmail(repository, search);
    }
  },
};

export default SearchViewHelper;
