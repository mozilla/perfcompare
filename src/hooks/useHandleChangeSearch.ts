import { FormEvent } from 'react';

import {
  updateSearchValue,
  updateSearchResults,
  setInputError,
} from '../reducers/SearchSlice';
import { Strings } from '../resources/Strings';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type { Repository, InputType } from '../types/state';
import { useAppDispatch } from './app';

interface HandleChangeProps {
  e: FormEvent<HTMLInputElement | HTMLTextAreaElement>;
  searchType: InputType;
  repository: Repository['name'];
}

const strings = Strings.errors;

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const dispatch = useAppDispatch();

  const searchByRevisionOrEmail = async (
    repository: Repository['name'],
    search: string,
    searchType: InputType,
  ) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    if (!search) {
      await dispatch(fetchRecentRevisions({ repository, searchType }));
    } else if (emailMatch.test(search)) {
      await dispatch(
        fetchRevisionsByAuthor({ repository, search, searchType }),
      );
    } else if (longHashMatch.test(search) || shortHashMatch.test(search)) {
      await dispatch(fetchRevisionByID({ repository, search, searchType }));
    } else {
      dispatch(
        setInputError({
          errorMessage: strings.warningText,
          searchType,
        }),
      );
    }
  };

  const handleChangeSearch = ({
    e,
    searchType,
    repository,
  }: HandleChangeProps) => {
    const search = e.currentTarget.value;
    dispatch(
      updateSearchValue({
        search,
        searchType,
      }),
    );

    dispatch(updateSearchResults({ results: [], searchType }));

    const idleTime = 500;
    const onTimeout = () => {
      void searchByRevisionOrEmail(repository, search, searchType);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(onTimeout, idleTime);
  };
  return { handleChangeSearch, searchByRevisionOrEmail };
};

export default useHandleChangeSearch;
