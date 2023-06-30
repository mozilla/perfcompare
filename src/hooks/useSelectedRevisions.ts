import { setSelectedRevisions } from '../reducers/SelectedRevisionsSlice';
import { RevisionsList } from '../types/state';
// import { truncateHash } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from './app';

const useSelectRevision = () => {
  const dispatch = useAppDispatch();

  const baseCheckedRevisions: RevisionsList[] = useAppSelector(
    (state) => state.search.base.checkedRevisions,
  );

  const newCheckedRevisions: RevisionsList[] = useAppSelector(
    (state) => state.search.new.checkedRevisions,
  );

  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const addSelectedRevisions = () => {
    const newSelected = [...selectedRevisions];
    newSelected.push(...baseCheckedRevisions, ...newCheckedRevisions);

    dispatch(setSelectedRevisions(newSelected));
    dispatch(clearCheckedRevisions());
  };

  return { addSelectedRevisions };
};

export default useSelectRevision;
