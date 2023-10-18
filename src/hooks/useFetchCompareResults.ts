import {
  fetchCompareResults,
  fetchFakeResults,
} from '../reducers/CompareResultsSlice';
import type { Repository } from '../types/state';
import type { FakeCommitHash } from '../types/types';
import { useAppDispatch } from './app';

function useFetchCompareResults() {
  const dispatch = useAppDispatch();

  const dispatchFetchCompareResults = (
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

  const fakeCommitHashes: FakeCommitHash[] = [
    'bb6a5e451dace3b9c7be42d24c9272738d73e6db',
    '9d50665254899d8431813bdc04178e6006ce6d59',
    'a998c42399a8fcea623690bf65bef49de20535b4',
  ];

  const dispatchFakeCompareResults = () => {
    for (const commitHash of fakeCommitHashes) {
      void dispatch(fetchFakeResults(commitHash));
    }
  };

  return { dispatchFetchCompareResults, dispatchFakeCompareResults };
}

export default useFetchCompareResults;
