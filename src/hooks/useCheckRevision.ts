import { useSnackbar, VariantType } from 'notistack';

import { updateCheckedRevisions } from '../reducers/SearchSlice';
import { updateEditModeRevisions } from '../reducers/SelectedRevisionsSlice';
import { RevisionsList } from '../types/state';
import { InputType } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = (searchType: InputType) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const searchCheckedRevisions: RevisionsList[] = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );
  const editModeRevisions = useAppSelector(
    (state) => state.selectedRevisions.editModeRevisions,
  );

  const handleToggle = (
    revision: RevisionsList,
    maxRevisions: number,
    isEditMode: boolean,
  ) => {
    const isChecked = searchCheckedRevisions.includes(revision);
    const newChecked = [...searchCheckedRevisions];

    // if item is not already checked, add to checked
    if (searchCheckedRevisions.length < maxRevisions && !isChecked) {
      newChecked.push(revision);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(searchCheckedRevisions.indexOf(revision), 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revision(s).`, { variant });
    }

    //create a new array with unique values
    const filteredChecked = [...new Set(newChecked)];

    dispatch(
      updateCheckedRevisions({ newChecked: filteredChecked, searchType }),
    );

    if (isEditMode) {
      //make a copy of editModeRevisions & filteredCheck
      const revisionsForUpdate = [...editModeRevisions, ...filteredChecked];

      //handle if based checked and put at 0 index
      if (searchType === 'base') {
        const baseRevision = newChecked[0];
        revisionsForUpdate.unshift(baseRevision);
      }

      //create a new array with unique values
      const filteredUpdated = [...new Set(revisionsForUpdate)];

      dispatch(
        updateEditModeRevisions({
          selectedRevisions: filteredUpdated,
          isBaseDeletion: false,
          isAddChecked: true,
        }),
      );
    }
  };

  const removeCheckedRevision = (revision: RevisionsList) => {
    const newChecked = [...searchCheckedRevisions];
    newChecked.splice(searchCheckedRevisions.indexOf(revision), 1);
    dispatch(updateCheckedRevisions({ newChecked, searchType }));
  };
  return { handleToggle, removeCheckedRevision };
};

export default useCheckRevision;
