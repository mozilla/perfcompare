import {
  updateSearchValue,
  updateSearchResults,
  setInputErrorBase,
  setInputErrorNew,
  clearInputErrorBase,
  clearInputErrorNew,
} from '../reducers/SearchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type { Repository } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

let timeout: null | ReturnType<typeof setTimeout> = null;

const useHandleChangeSearch = () => {
  const dispatch = useAppDispatch();
  const getBaseRepository = useAppSelector(
    (state) => state.search.baseRepository,
  );
  const getNewRepository = useAppSelector(
    (state) => state.search.newRepository,
  );
  const warningText =
    'Search must be a 12- or 40-character hash, or email address';

  const handleFetch = async (
    search: string,
    repository: Repository['name'],
    searchType: 'base' | 'new',
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
      if (searchType === 'base') {
        dispatch(setInputErrorBase(warningText));
      }

      if (searchType === 'new') {
        dispatch(setInputErrorNew(warningText));
      }
    }
  };

  const searchByRevisionOrEmail = async (
    repository: Repository['name'],
    search: string,
    searchType: 'base' | 'new',
  ) => {
    await handleFetch(search, repository, searchType);
  };

  const handleChangeSearch = ({ baseSearch, newSearch }: SearchProps) => {
    const search = baseSearch.length > 0 ? baseSearch : newSearch;
    const repository =
      baseSearch.length > 0 ? getBaseRepository : getNewRepository;
    const searchType = baseSearch.length > 0 ? 'base' : 'new';

    dispatch(updateSearchValue(search));
    dispatch(updateSearchResults([]));
    if (baseSearch.length > 0) {
      dispatch(clearInputErrorBase());
    }

    if (newSearch.length > 0) {
      dispatch(clearInputErrorNew());
    }

    const idleTime = 500;
    const onTimeout = () => {
      void searchByRevisionOrEmail(repository, search, searchType);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(onTimeout, idleTime);
  };
  return { handleChangeSearch };
};

interface SearchProps {
  baseSearch: string;
  newSearch: string;
}

export default useHandleChangeSearch;
