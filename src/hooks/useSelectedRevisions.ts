import { setCheckedRevisionsForEdit } from '../reducers/SearchSlice';
import {
  setSelectedRevisions,
  deleteRevision,
} from '../reducers/SelectedRevisionsSlice';
import { RevisionsList } from '../types/state';
import { InputType } from '../types/state';
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
    //create a new array with unique values
    const filteredSelected = [...new Set(newSelected)];

    dispatch(setSelectedRevisions({ selectedRevisions: filteredSelected }));
  };

  const editSelectedRevisions = (searchType: InputType) => {
    let revisionsForEdit = [...selectedRevisions];
    switch (searchType) {
      case 'base':
        revisionsForEdit = [revisionsForEdit[0]];
        break;
      case 'new':
        revisionsForEdit = revisionsForEdit.slice(1);
        break;
      default:
        break;
    }
    dispatch(
      setCheckedRevisionsForEdit({ revisions: revisionsForEdit, searchType }),
    );
  };

  const updateSelectedRevisions = (searchType: InputType) => {
    let updatedRevisions = [...selectedRevisions];

    switch (searchType) {
      case 'base':
        //remove old base revision
        updatedRevisions = updatedRevisions.slice(1);
        //add new base revision
        updatedRevisions.unshift(...baseCheckedRevisions);
        break;
      case 'new':
        //keep the base revision, add the new checked revisions
        updatedRevisions = [
          ...updatedRevisions.slice(0, 1),
          ...newCheckedRevisions,
        ];
        //create a new array with unique values
        updatedRevisions = [...new Set(updatedRevisions)];
        break;
      default:
        break;
    }

    dispatch(setSelectedRevisions({ selectedRevisions: updatedRevisions }));
  };

  const deleteSelectedRevisions = (revision: RevisionsList) => {
    const newSelected = [...selectedRevisions];
    newSelected.splice(selectedRevisions.indexOf(revision), 1);
    dispatch(deleteRevision({ selectedRevisions: newSelected }));
  };

  return {
    addSelectedRevisions,
    deleteSelectedRevisions,
    editSelectedRevisions,
    updateSelectedRevisions,
  };
};

export default useSelectRevision;
