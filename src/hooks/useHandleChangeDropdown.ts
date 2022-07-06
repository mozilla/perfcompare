import { useDispatch } from 'react-redux';

import { updateRepository } from '../reducers/SearchSlice';
import { fetchRecentRevisions } from '../thunks/searchThunk';
import type { Repository } from '../types/state';

function useHandleChangeDropdown() {
  const dispatch = useDispatch();

  const handleChangeDropdown = (e: React.MouseEvent<HTMLLIElement>) => {
    const repository = e.currentTarget.id;

    dispatch(updateRepository(repository as Repository['name']));

    // Fetch 10 most recent revisions when repository changes
    dispatch(fetchRecentRevisions(repository as Repository['name']));
  };
  return { handleChangeDropdown };
}

export default useHandleChangeDropdown;
