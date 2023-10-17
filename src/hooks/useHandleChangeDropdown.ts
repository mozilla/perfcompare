import {
  updateRepository,
  fetchRecentRevisions,
} from '../reducers/SearchSlice';
import type { Repository, InputType } from '../types/state';
import { useAppDispatch } from './app';

interface DropdownProps {
  searchType: InputType;
  selectedRepository: string;
}

function useHandleChangeDropdown() {
  const dispatch = useAppDispatch();

  const handleChangeDropdown = async ({
    selectedRepository,
    searchType,
  }: DropdownProps) => {
    const repository = selectedRepository as Repository['name'];

    dispatch(
      updateRepository({
        repository,
        searchType,
      }),
    );

    // Fetch 10 most recent revisions when repository changes
    await dispatch(fetchRecentRevisions({ repository, searchType }));
  };
  return { handleChangeDropdown };
}

export default useHandleChangeDropdown;
