import {
  updateBaseRepository,
  updateNewRepository,
} from '../reducers/SearchSlice';
import { fetchRecentRevisions } from '../thunks/searchThunk';
import type { Repository } from '../types/state';
import { useAppDispatch } from './app';

function useHandleChangeDropdown() {
  const dispatch = useAppDispatch();

  const handleChangeDropdown = async ({
    baseRepository,
    newRepository,
  }: DropdownProps) => {
    const repository =
      baseRepository !== ''
        ? (baseRepository as Repository['name'])
        : (newRepository as Repository['name']);
    const searchType = baseRepository !== '' ? 'base' : 'new';

    if (baseRepository !== '') {
      dispatch(updateBaseRepository(repository));
    }

    if (newRepository !== '') {
      dispatch(updateNewRepository(repository));
    }

    // Fetch 10 most recent revisions when repository changes
    await dispatch(fetchRecentRevisions({ repository, searchType }));
  };
  return { handleChangeDropdown };
}

interface DropdownProps {
  baseRepository: string;
  newRepository: string;
}

export default useHandleChangeDropdown;
