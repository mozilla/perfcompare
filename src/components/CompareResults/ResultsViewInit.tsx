import { useEffect } from 'react';

import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { InputType } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function ResultsViewInit() {
  const dispatch = useAppDispatch();
  const repositoryBase = useAppSelector(
    (state) => state.search.base.repository,
  );
  const repositoryNew = useAppSelector((state) => state.search.new.repository);

  /* editing the revisions requires fetching the
   * recent revisions in results view
   */
  useEffect(() => {
    const repository = repositoryBase;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'base' as InputType,
      }),
    );
  }, [repositoryBase]);

  useEffect(() => {
    const repository = repositoryNew;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'new' as InputType,
      }),
    );
  }, [repositoryNew]);

  return null;
}

export default ResultsViewInit;
