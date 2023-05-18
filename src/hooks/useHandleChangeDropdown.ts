import { updateRepository } from '../reducers/SearchSlice';
import { fetchRecentRevisions } from '../thunks/searchThunk';
import type { Repository } from '../types/state';
import { useAppDispatch } from './app';

function useHandleChangeDropdown() {
  const dispatch = useAppDispatch();

  const handleChangeDropdown = async ({
    baseRepository,
    newRepository,
    searchType,
  }: DropdownProps) => {
    const repository =
      searchType == 'base'
        ? (baseRepository as Repository['name'])
        : (newRepository as Repository['name']);

    if (searchType == 'base') {
      dispatch(updateBaseRepository(repository));
    }

    if (searchType == 'new') {
      dispatch(updateNewRepository(repository));
    }

    // Fetch 10 most recent revisions when repository changes
    await dispatch(fetchRecentRevisions(repository as Repository['name']));
  };
  return { handleChangeDropdown };
}

interface DropdownProps {
  baseRepository: string;
  newRepository: string;
  searchType: 'base' | 'new';
}

export default useHandleChangeDropdown;
