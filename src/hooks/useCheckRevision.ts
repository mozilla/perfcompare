import { useSnackbar, VariantType } from 'notistack';

import { maxRevisionsError } from '../common/constants';
import { setCheckedRevisions } from '../reducers/CheckedRevisions';
import { Revision } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const checkedRevisions: Revision[] = useAppSelector(
    (state) => state.checkedRevisions.revisions,
  );

  const handleToggle = (revision: Revision) => {
    const isChecked = checkedRevisions.includes(revision);
    const newChecked = [...checkedRevisions];

    // if item is not already checked, add to checked
    if (checkedRevisions.length < 4 && !isChecked) {
      newChecked.push(revision);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(checkedRevisions.indexOf(revision), 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      const variant: VariantType = 'warning';
      enqueueSnackbar(maxRevisionsError, { variant });
    }

    dispatch(setCheckedRevisions(newChecked));
  };
  return { checkedRevisions, handleToggle };
};

export default useCheckRevision;
