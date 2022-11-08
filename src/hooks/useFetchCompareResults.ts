import {
  clearSearchResults,
  setSelectedRevisions,
} from '../reducers/SelectedRevisions';
import { fetchCompareResults } from '../thunks/compareResultsThunk';
import { fetchSelectedRevisions } from '../thunks/selectedRevisionsThunk';
import type { Repository, Revision } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

function useFetchCompareResults() {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(
    (state) => state.selectedRevisions.searchResults,
  );

  const dispatchFetchCompareResults = async (
    repos: Repository['name'][] | null,
    revs: string[] | undefined,
  ) => {
    let baseRepo;
    let baseRev;
    let newRepo;
    let newRev;
    if (repos && revs) {
      // If there is only one selected revision, base and new should be the same
      if (revs.length == 1) {
        baseRepo = newRepo = repos[0];
        baseRev = newRev = revs[0];
        void dispatch(
          fetchCompareResults({ baseRepo, baseRev, newRepo, newRev }),
        );
      } else if (revs.length == 2) {
        baseRepo = repos[0];
        baseRev = revs[0];
        newRepo = repos[1];
        newRev = revs[1];
        void dispatch(
          fetchCompareResults({ baseRepo, baseRev, newRepo, newRev }),
        );
      }
      // TODO: handle case for more than two selected revisions
    }
  };

  const useFetchSelectedRevisions = async (repos: string, revs: string) => {
    const paramRepos: string[] = repos.split(',');
    const paramRevs: string[] = revs.split(',');
    dispatch(clearSearchResults());

    for (let i = 0; i < paramRepos.length; i++) {
      const repo = paramRepos[i];
      const rev = paramRevs[i];
      await dispatch(fetchSelectedRevisions({ repo, rev }));
    }
    dispatch(setSelectedRevisions(searchResults));
  };
  return { dispatchFetchCompareResults, useFetchSelectedRevisions };
}

export default useFetchCompareResults;
