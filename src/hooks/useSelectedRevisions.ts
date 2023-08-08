import {
  setSelectedRevisions,
  deleteRevision,
} from '../reducers/SelectedRevisionsSlice';
import { RevisionsList } from '../types/state';
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
    //remove duplicates of the same revision
    const filteredSelected = newSelected.filter(
      (revision, index, self) =>
        self.findIndex((r) => r.id === revision.id) === index,
    );

    dispatch(setSelectedRevisions({ selectedRevisions: filteredSelected }));
  };

  const deleteSelectedRevisions = (revision: RevisionsList) => {
    const newSelected = [...selectedRevisions];
    newSelected.splice(selectedRevisions.indexOf(revision), 1);
    dispatch(deleteRevision({ selectedRevisions: newSelected }));
  };

  return { addSelectedRevisions, deleteSelectedRevisions };
};

export default useSelectRevision;
