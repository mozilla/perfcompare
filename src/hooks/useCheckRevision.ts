import React from 'react';

import { useSnackbar, VariantType } from 'notistack';

import { maxRevisionsError } from '../common/constants';
import { setCheckedRevisions } from '../reducers/CheckedRevisions';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const checkedRevisions: number[] = useAppSelector(
    (state) => state.checkedRevisions.revisions,
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
      const variant: VariantType = 'warning';
      enqueueSnackbar(maxRevisionsError, { variant });
    }

    dispatch(setCheckedRevisions(newChecked));
  };
  return { checkedRevisions, handleToggle };
};

export default useCheckRevision;
