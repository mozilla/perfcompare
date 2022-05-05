import { FormEvent, MouseEvent } from 'react';

import store from '../common/store';
import {
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
import type { Repository } from '../types/state';

let timeout: NodeJS.Timeout;

const searchByRevisionOrEmail = (
  repository: Repository['name'],
  search: string,
) => {
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
};

const handleChangeDropdown = (event: MouseEvent) => {
  const repository = (event.target as Element).id as Repository['name'];

  // Update state with selected repository
  store.dispatch(updateRepository(repository));

  // Fetch 10 most recent revisions when repository changes
  store.dispatch(fetchRecentRevisions(repository));
};

const handleChangeSearch = (
  event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const search = event.currentTarget.value;
  const { repository } = store.getState().search;
  store.dispatch(updateSearchValue(search));
  store.dispatch(updateSearchResults([]));
  store.dispatch(clearInputError());

  const idleTime = 500;
  const onTimeout = () => {
    searchByRevisionOrEmail(repository, search);
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
};

export { handleChangeDropdown, handleChangeSearch };
