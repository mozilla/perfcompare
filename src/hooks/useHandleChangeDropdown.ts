import { updateRepository as updateRepositoryCompareWithBase } from '../reducers/SearchSlice';
import { updateRepository as updateRepositoryCompareOverTime } from '../reducers/SearchSliceCompareOverTime';
import { fetchRecentRevisions } from '../thunks/searchThunk';
import type { Repository, InputType, ComparisonType } from '../types/state';
import { useAppDispatch } from './app';

interface DropdownProps {
  searchType: InputType;
  comparisonType: ComparisonType;
  selectedRepository: string;
}

function useHandleChangeDropdown() {
  const dispatch = useAppDispatch();

  const handleChangeDropdown = async ({
    selectedRepository,
    searchType,
    comparisonType,
  }: DropdownProps) => {
    const repository = selectedRepository as Repository['name'];
    if (comparisonType == 'searchCompareWithBase') {
      dispatch(
        updateRepositoryCompareWithBase({
          repository,
          searchType,
        }),
      );
    } else {
      dispatch(
        updateRepositoryCompareOverTime({
          repository,
          searchType,
        }),
      );
    }

    // Fetch 10 most recent revisions when repository changes
    // Check
    await dispatch(fetchRecentRevisions({ repository, searchType }));
  };
  return { handleChangeDropdown };
}

export default useHandleChangeDropdown;
