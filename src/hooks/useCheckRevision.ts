import { useSnackbar, VariantType } from 'notistack';

import { updateCheckedRevisions } from '../reducers/SearchSlice';
import { RevisionsList } from '../types/state';
import { InputType } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = (searchType: InputType) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const searchCheckedRevisions: RevisionsList[] = useAppSelector(
    (state) => state.searchCompareWithBase[searchType].checkedRevisions,
  );

  const handleToggle = (revision: RevisionsList, maxRevisions: number) => {
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

    dispatch(updateCheckedRevisions({ newChecked, searchType }));
  };

  const removeCheckedRevision = (revision: RevisionsList) => {
    const newChecked = [...searchCheckedRevisions];
    newChecked.splice(searchCheckedRevisions.indexOf(revision), 1);
    dispatch(updateCheckedRevisions({ newChecked, searchType }));
  };
  return { handleToggle, removeCheckedRevision };
};

export default useCheckRevision;
