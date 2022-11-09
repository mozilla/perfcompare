import {
  clearSearchResults,
  clearSelectedRevisions,
  setSelectedRevisions,
} from '../reducers/SelectedRevisions';
import { fetchCompareResults } from '../thunks/compareResultsThunk';
import { fetchSelectedRevisions } from '../thunks/selectedRevisionsThunk';
import type { Repository, Revision } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

function useFetchCompareResults() {
  const dispatch = useAppDispatch();
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const searchResults = useAppSelector(
    (state) => state.selectedRevisions.searchResults,
  );

  const dispatchFetchCompareResults = async (
    compareRepos: Repository['name'][] | null,
    compareRevs: string[] | undefined,
  ) => {
    let baseRepo;
    let baseRev;
    let newRepo;
    let newRev;
    if (compareRepos && compareRevs) {
      // If there is only one selected revision, base and new should be the same
      if (compareRevs.length == 1) {
        baseRepo = newRepo = compareRepos[0];
        baseRev = newRev = compareRevs[0];
        void dispatch(
          fetchCompareResults({ baseRepo, baseRev, newRepo, newRev }),
        );
      } else if (compareRevs.length == 2) {
        baseRepo = compareRepos[0];
        baseRev = compareRevs[0];
        newRepo = compareRepos[1];
        newRev = compareRevs[1];
        void dispatch(
          fetchCompareResults({ baseRepo, baseRev, newRepo, newRev }),
        );
      }
      // TODO: handle case for more than two selected revisions
    }
  };

  return { dispatchFetchCompareResults };
}

export default useFetchCompareResults;
