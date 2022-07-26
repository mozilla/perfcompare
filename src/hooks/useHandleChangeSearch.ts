import { FormEvent } from 'react';

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
import { useAppDispatch, useAppSelector } from './app';

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const dispatch = useAppDispatch();
  const getRepository = useAppSelector(
    (state: State) => state.search.repository,
  );

  const searchByRevisionOrEmail = async (
    repository: Repository['name'],
    search: string,
  ) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    if (emailMatch.test(search)) {
      await dispatch(fetchRevisionsByAuthor({ repository, search }));
    } else if (longHashMatch.test(search) || shortHashMatch.test(search)) {
      await dispatch(fetchRevisionByID({ repository, search }));
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
      void searchByRevisionOrEmail(getRepository, search);
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
