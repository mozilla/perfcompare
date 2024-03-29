import { useEffect } from 'react';

import { useAppDispatch } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { InputType, Repository } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function SearchViewInit({
  repositoryBase,
  repositoryNew,
}: {
  repositoryBase: Repository['name'];
  repositoryNew: Repository['name'];
}) {
  const dispatch = useAppDispatch();

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
