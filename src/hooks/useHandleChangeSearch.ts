import { FormEvent, useState } from 'react';

import {
  updateSearchValue,
  updateSearchResults,
  setInputError,
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../reducers/SearchSlice';
import { Strings } from '../resources/Strings';
import type { Repository, InputType } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

interface HandleChangeProps {
  e: FormEvent<HTMLInputElement | HTMLTextAreaElement>;
  searchType: InputType;
}

const strings = Strings.errors;

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const [searchTypeValue, setSearchTypeValue] = useState<InputType>('base');

  const searchState = useAppSelector((state) => state.search[searchTypeValue]);
  const currentRepository = searchState.repository;

  const dispatch = useAppDispatch();

  const handleFetch = async (
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
      const isError = dispatch(
        setInputError({
          errorMessage: strings.warningText,
          searchType,
        }),
      );
      return isError;
    }
  };

  const searchByRevisionOrEmail = async (
    repository: Repository['name'],
    search: string,
    searchType: InputType,
  ) => {
    await handleFetch(repository, search, searchType);
  };

  const handleChangeSearch = ({ e, searchType }: HandleChangeProps) => {
    setSearchTypeValue(searchType);
    const search = e.currentTarget.value;
    const repository = currentRepository;
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
