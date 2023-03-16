import { FormEvent } from 'react';

import { RootState } from '../../common/store';
import {
  updateSearchValue,
  updateSearchResults,
  setInputError,
  clearInputError,
} from '../../reducers/SearchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../../thunks/searchThunk';
import type { Repository } from '../../types/state';
import { useAppDispatch, useAppSelector } from '../app';

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const dispatch = useAppDispatch();
  const getRepository = useAppSelector(
    (state: RootState) => state.search.repository,
  );

  const searchByRevisionOrEmail = async (
    repository: Repository['name'],
    search: string,
  ) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;
    if (!search) {
      await dispatch(fetchRecentRevisions(repository));
    } else if (emailMatch.test(search)) {
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

    timeout = setTimeout(onTimeout, idleTime);
  };
  return { handleChangeSearch };
};

export default useHandleChangeSearch;
