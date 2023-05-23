import { useEffect } from 'react';

import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';

// component to fetch recent revisions when search view is loaded
function SearchViewInit() {
  const dispatch = useAppDispatch();
  const repository = useAppSelector((state) => state.search.baseRepository);
  useEffect(() => {
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'base' as 'base' | 'new',
      }),
    );
  }, []);
  return null;
}

export default SearchViewInit;
