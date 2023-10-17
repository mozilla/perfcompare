import { useEffect } from 'react';

import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import { fetchRecentRevisions } from '../../reducers/SearchSlice';
import { InputType } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function SearchViewInit() {
  const dispatch = useAppDispatch();
  const repositoryBase = useAppSelector(
    (state) => state.search.base.repository,
  );
  const repositoryNew = useAppSelector((state) => state.search.new.repository);

  useEffect(() => {
    const repository = repositoryBase;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'base' as InputType,
      }),
    );
  }, []);

  useEffect(() => {
    const repository = repositoryNew;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'new' as InputType,
      }),
    );
  }, []);

  return null;
}

export default SearchViewInit;
