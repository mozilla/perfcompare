import { setSelectedRevisions } from '../reducers/SelectedRevisionsSlice';
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
    const filteredSelected = newSelected.filter(
      (revision, index, self) =>
        self.findIndex((r) => r.id === revision.id) === index,
    );

    dispatch(setSelectedRevisions({ selectedRevisions: filteredSelected }));
  };

  return { addSelectedRevisions };
};

export default useSelectRevision;
