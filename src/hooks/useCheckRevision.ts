import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../common/store';
import { setCheckedRevisions } from '../reducers/CheckedRevisions';
import useAlert from './useAlert';
import useFocusInput from './useFocusInput';

const useCheckRevision = () => {
  const { dispatchSetAlert } = useAlert();
  const { handleChildClick } = useFocusInput();
  const dispatch = useDispatch();

  const checkedRevisions: number[] = useSelector(
    (state: RootState) => state.checkedRevisions.revisions,
  );

  const handleToggle = (e: React.MouseEvent) => {
    const revisionIndex = parseInt((e.currentTarget as HTMLElement).id, 10);
    const isChecked = checkedRevisions.includes(revisionIndex);
    const newChecked = [...checkedRevisions];

    // if item is not already checked, add to checked
    if (checkedRevisions.length < 4 && !isChecked) {
      newChecked.push(revisionIndex);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(checkedRevisions.indexOf(revisionIndex), 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      dispatchSetAlert('Maximum 4 Revisions', 'warning');
    }
    handleChildClick(e);

    dispatch(setCheckedRevisions(newChecked));
  };
  return { checkedRevisions, handleToggle };
};

export default useCheckRevision;
