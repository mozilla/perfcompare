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

  //when the user clicks the "Compare" button
  const addSelectedRevisions = () => {
    const newSelected = [...selectedRevisions];
    newSelected.push(...baseCheckedRevisions, ...newCheckedRevisions);
    //create a new array with unique values
    const filteredSelected = [...new Set(newSelected)];
    dispatch(setSelectedRevisions({ selectedRevisions: filteredSelected }));
  };

  return {
    addSelectedRevisions,
  };
};

export default useSelectRevision;
