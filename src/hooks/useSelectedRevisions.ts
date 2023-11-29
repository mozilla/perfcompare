import { setCheckedRevisionsForEdit } from '../reducers/SearchSlice';
import {
  setSelectedRevisions,
  updateEditModeRevisions,
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

  const selectedRevisionsState = useAppSelector(
    (state) => state.selectedRevisions,
  );

  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const editModeRevisions = useAppSelector(
    (state) => state.selectedRevisions.editModeRevisions,
  );

  const addSelectedRevisions = (isEditable: boolean) => {
    if (isEditable) {
      dispatch(setSelectedRevisions({ selectedRevisions: editModeRevisions }));
      return;
    }
    const newSelected = [...selectedRevisions];
    newSelected.push(...baseCheckedRevisions, ...newCheckedRevisions);
    //create a new array with unique values
    const filteredSelected = [...new Set(newSelected)];
    dispatch(setSelectedRevisions({ selectedRevisions: filteredSelected }));
  };

  const editSelectedRevisions = (searchType: InputType) => {
    let revisionsForEdit = selectedRevisions;
    switch (searchType) {
      case 'base':
        revisionsForEdit = selectedRevisionsState.base;
        break;
      case 'new':
        revisionsForEdit = selectedRevisionsState.new;
        break;
      default:
        throw new Error('Invalid search type');
    }
    dispatch(
      setCheckedRevisionsForEdit({ revisions: revisionsForEdit, searchType }),
    );
  };

  const deleteSelectedRevisions = (revision: RevisionsList) => {
    const newSelected = [...editModeRevisions];
    if (selectedRevisions[0].id === revision.id) {
      //this is a base revision deletion
      dispatch(
        updateEditModeRevisions({
          selectedRevisions: selectedRevisions.slice(1),
          isBaseDeletion: true,
          isAddChecked: false,
        }),
      );
      return;
    }

    newSelected.splice(selectedRevisions.indexOf(revision), 1);
    dispatch(
      updateEditModeRevisions({
        selectedRevisions: newSelected,
        isBaseDeletion: false,
        isAddChecked: false,
      }),
    );
  };

  return {
    addSelectedRevisions,
    deleteSelectedRevisions,
    editSelectedRevisions,
  };
};

export default useSelectRevision;
