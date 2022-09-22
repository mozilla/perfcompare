import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { Repository } from '../types/state';
import { useAppDispatch } from './app';

function useFetchCompareResults() {
  const dispatch = useAppDispatch();

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
  return { dispatchFetchCompareResults };
}

export default useFetchCompareResults;
