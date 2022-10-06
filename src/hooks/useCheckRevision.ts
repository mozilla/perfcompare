import { useSnackbar, VariantType } from 'notistack';

import { setCheckedRevisions } from '../reducers/CheckedRevisions';
import { Revision } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = (selectedRevisionsCount: number) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const checkedRevisions: Revision[] = useAppSelector(
    (state) => state.checkedRevisions.revisions,
  );

  const handleToggle = (revision: Revision, view: string) => {
    const isChecked = checkedRevisions.includes(revision);
    const newChecked = [...checkedRevisions];
    const maxRevisions = view == 'compare-results' ? 1 : 2;

    // if item is not already checked, add to checked
    if (view === 'search' && selectedRevisionsCount < maxRevisions && checkedRevisions.length < maxRevisions && !isChecked) {
      newChecked.push(revision);
    } else if (view == 'compare-results' && checkedRevisions.length < maxRevisions && !isChecked) {
      newChecked.push(revision);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(checkedRevisions.indexOf(revision), 1);
    } else {
      // Search View: if there are already 2 checked revisions, display warning
      // Compare View: if there is already 1 checked revision, display warning
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revision(s).`, { variant });
    }

    dispatch(setCheckedRevisions(newChecked));
  };
  return { checkedRevisions, handleToggle };
};

export default useCheckRevision;
