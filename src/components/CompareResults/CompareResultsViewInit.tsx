import { useEffect } from 'react';

import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import {
  clearSearchResults,
  setSelectedRevisions,
} from '../reducers/SelectedRevisions';
import type { RootState } from '../../common/store';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { fetchSelectedRevisions } from '../../thunks/selectedRevisionsThunk';
import type { Repository } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function CompareResultsViewInit() {
  const dispatch = useAppDispatch();
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const { useFetchSelectedRevisions } = useFetchCompareResults();

  const { repos, revs } = useParams();

  useEffect(() => {
    if (repos && revs) {
      const paramRepos: string[] = repos.split(',');
      const paramRevs: string[] = revs.split(',');

      dispatch(clearSearchResults());
      void useFetchSelectedRevisions(repos, revs);
    }
  });

  //   useEffect(() => {
  //     void dispatch(fetchRecentRevisions(repository));
  //   }, []);
  return null;
}

export default CompareResultsViewInit;
