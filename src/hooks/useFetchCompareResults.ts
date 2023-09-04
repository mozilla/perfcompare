import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { Repository } from '../types/state';
import { useAppDispatch } from './app';

function useFetchCompareResults() {
  const dispatch = useAppDispatch();

  const dispatchFetchCompareResults = async (
    repos: Repository['name'][] | null,
    revs: string[] | undefined,
    framework: string,
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
          fetchCompareResults({
            baseRepo,
            baseRev,
            newRepo,
            newRev,
            framework,
          }),
        );
      } else if (revs.length == 2) {
        baseRepo = repos[0];
        baseRev = revs[0];
        newRepo = repos[1];
        newRev = revs[1];
        void dispatch(
          fetchCompareResults({
            baseRepo,
            baseRev,
            newRepo,
            newRev,
            framework,
          }),
        );
      } else if (revs.length > 2 && revs.length <= 4) {
        baseRepo = repos[0];
        baseRev = revs[0];
        for (let i = 1; i < revs.length; i++) {
          newRepo = repos[i];
          newRev = revs[i];
          void dispatch(
            fetchCompareResults({
              baseRepo,
              baseRev,
              newRepo,
              newRev,
              framework,
            }),
          );
        }
      }
    }
  };
  return { dispatchFetchCompareResults };
}

export default useFetchCompareResults;
