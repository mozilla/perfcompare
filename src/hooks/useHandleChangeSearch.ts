import { FormEvent } from 'react';

import { setInputError } from '../reducers/SearchSlice';
import { Strings } from '../resources/Strings';
import type { Repository, InputType } from '../types/state';
import { useAppDispatch } from './app';

interface HandleChangeProps {
  e: FormEvent<HTMLInputElement | HTMLTextAreaElement>;
  searchType: InputType;
  repository: Repository['name'];
}

const strings = Strings.errors;

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = (fetcherLoad: (url: string) => void) => {
  const dispatch = useAppDispatch();

  const searchRecentRevisions = async (
    repository: Repository['name'],
    searchTerm: string,
    searchType: InputType,
  ) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hashMatch = /\b[a-f0-9]+\b/;

    let apiUrl = `/api/recent-revisions/${repository}`;

    if (emailMatch.test(searchTerm)) {
      apiUrl += '/by-author/' + encodeURIComponent(searchTerm);
    } else if (hashMatch.test(searchTerm)) {
      apiUrl += '/by-hash/' + encodeURIComponent(searchTerm);
    } else if (searchTerm) {
      dispatch(
        setInputError({
          errorMessage: strings.warningText,
          searchType,
        }),
      );
      return;
    }

    fetcherLoad(apiUrl);
  };

  const handleChangeSearch = ({
    e,
    searchType,
    repository,
  }: HandleChangeProps) => {
    const search = e.currentTarget.value;
    const idleTime = 500;
    const onTimeout = () => {
      void searchRecentRevisions(repository, search, searchType);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(onTimeout, idleTime);
  };
  return { handleChangeSearch, searchRecentRevisions };
};

export default useHandleChangeSearch;
