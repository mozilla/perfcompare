import { useSnackbar } from 'notistack';

import { repoMap } from '../common/constants';
import { setFramework } from '../reducers/CompareResultsSlice';
import { updateRepository } from '../reducers/SearchSlice';
import { fetchCompareResults } from '../thunks/compareResultsThunk';
import { fetchRecentRevisions } from '../thunks/searchThunk';
import type { Repository, Revision } from '../types/state';
import { Framework } from '../types/types';
import { useAppDispatch } from './app';

function useHandleChangeDropdown() {
  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const handleRepoDropdownChange = async (
    e: React.MouseEvent<HTMLLIElement>,
  ) => {
    const repository = e.currentTarget.id;

    dispatch(updateRepository(repository as Repository['name']));

    // Fetch 10 most recent revisions when repository changes
    await dispatch(fetchRecentRevisions(repository as Repository['name']));
  };

  const handleFrameworkDropdownChange = async (
    framework: Framework,
    selectedRevisions: Revision[],
  ) => {
    dispatch(setFramework(framework));

    // TODO: handle comparing without base or more than two revisions
    try {
      const baseRepo = repoMap[selectedRevisions[0].repository_id];
      const baseRev = selectedRevisions[0].revision;
      const newRepo = repoMap[selectedRevisions[1].repository_id];
      const newRev = selectedRevisions[1].revision;

      const frameworkID = framework.id;
      // Fetch comparison results for current framework
      await dispatch(
        fetchCompareResults({
          baseRepo,
          baseRev,
          newRepo,
          newRev,
          frameworkID,
        }),
      );
    } catch {
      enqueueSnackbar('An error has occurred', { variant: 'warning' });
    }
  };
  return { handleRepoDropdownChange, handleFrameworkDropdownChange };
}

export default useHandleChangeDropdown;
