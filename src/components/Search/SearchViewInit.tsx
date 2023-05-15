import { useEffect } from 'react';


import type { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { useAppDispatch } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';

// component to fetch recent revisions when search view is loaded
function SearchViewInit() {
  const dispatch = useAppDispatch();
  const baseRepo = useAppSelector(
    (state: RootState) => state.search.baseRepository,
  );
  const newRepo = useAppSelector(
    (state: RootState) => state.search.newRepository,
  );

  useEffect(() => {
    const repository = baseRepo;
    const searchType = 'base';
    void dispatch(fetchRecentRevisions({ repository, searchType }));
  }, []);

  useEffect(() => {
    const repository = newRepo;
    const searchType = 'new';
    void dispatch(fetchRecentRevisions({ repository, searchType }));
  }, []);

  return null;
}

export default SearchViewInit;
