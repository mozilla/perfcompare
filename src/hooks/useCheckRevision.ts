import { useSnackbar, VariantType } from 'notistack';

import { updateCheckedRevisions } from '../reducers/SearchSlice';
import { InputType, Changeset } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = (isBase: boolean, isEditable: boolean) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const searchType: InputType = isBase ? 'base' : 'new';

  const searchCheckedRevisions: Changeset[] = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );

  const setToggleState = (
    revision: Changeset,
    maxRevisions: number,
    revisionsList: Changeset[],
  ) => {
    const isChecked = revisionsList.map((rev) => rev.id).includes(revision.id);
    const newChecked = [...revisionsList];

    // if item is not already checked, add to checked
    if (revisionsList.length < maxRevisions && !isChecked) {
      newChecked.push(revision);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(revisionsList.indexOf(revision), 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revision(s).`, { variant });
    }

    const filteredChecked = [...new Set(newChecked)];
    return filteredChecked;
  };

  const handleToggle = (
    revision: Changeset,
    maxRevisions: number,
    inProgressRevisions: Changeset[],
  ) => {
    //handle the state of "in progress" revisions in results view
    if (isEditable) {
      const filteredChecked = setToggleState(
        revision,
        maxRevisions,
        inProgressRevisions,
      );
      return filteredChecked;
    }

    //handle the state of "checked" revisions in search view
    const filteredChecked = setToggleState(
      revision,
      maxRevisions,
      searchCheckedRevisions,
    );

    dispatch(
      updateCheckedRevisions({ newChecked: filteredChecked, searchType }),
    );
    return filteredChecked;
  };

  const removeCheckedRevision = (revision: Changeset) => {
    const newChecked = [...searchCheckedRevisions];
    newChecked.splice(searchCheckedRevisions.indexOf(revision), 1);
    dispatch(updateCheckedRevisions({ newChecked, searchType }));
  };
  return { handleToggle, removeCheckedRevision };
};

export default useCheckRevision;
