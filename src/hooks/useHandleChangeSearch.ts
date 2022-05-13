import { FormEvent } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  updateSearchValue,
  updateSearchResults,
  setInputError,
  clearInputError,
} from '../reducers/SearchSlice';
import {
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type { Repository, State } from '../types/state';

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const dispatch = useDispatch();
  const getRepository = useSelector((state: State) => state.search.repository);

  const searchByRevisionOrEmail = (
    repository: Repository['name'],
    search: string,
  ) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    if (emailMatch.test(search)) {
      dispatch(fetchRevisionsByAuthor({ repository, search }));
    } else if (longHashMatch.test(search) || shortHashMatch.test(search)) {
      dispatch(fetchRevisionByID({ repository, search }));
    } else {
      dispatch(
        setInputError(
          'Search must be a 12- or 40-character hash, or email address',
        ),
      );
    }
  };

  const handleChangeSearch = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const search = event.currentTarget.value;

    dispatch(updateSearchValue(search));
    dispatch(updateSearchResults([]));
    dispatch(clearInputError());
    const idleTime = 500;
    const onTimeout = () => {
      searchByRevisionOrEmail(getRepository, search);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    // If search input is cleared, clear results
    if (search === '') {
      dispatch(updateSearchResults([]));
    } else {
      // Submit API call 500ms after user stops typing
      timeout = setTimeout(onTimeout, idleTime);
    }
  };
  return { handleChangeSearch };
};

export default useHandleChangeSearch;
