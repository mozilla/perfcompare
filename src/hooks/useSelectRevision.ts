import { useSnackbar, VariantType } from 'notistack';

import { maxRevisionsError, featureNotSupportedError } from '../common/constants';
import { clearCheckedRevisions } from '../reducers/CheckedRevisions';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import { Revision } from '../types/state';
import { truncateHash } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from './app';

const useSelectRevision = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const checkedRevisions = useAppSelector(
    (state) => state.checkedRevisions.revisions,
  );

  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const warningVariant: VariantType = 'warning';

  const enqueueAlreadySelectedAlert = (
    item: Revision,
    variant: VariantType,
  ) => {
    enqueueSnackbar(
      `Revision ${truncateHash(item.revision)} is already selected.`,
      {
        variant,
      },
    );
  };

  const addSelectedRevisions = () => {
    const newSelected = [...selectedRevisions];

    //
    if (selectedRevisions.length == 0 && checkedRevisions.length == 1) {
      enqueueSnackbar(featureNotSupportedError as string, {
        variant: warningVariant,
      });
      return false;
    }

    checkedRevisions.every((item) => {
      const isSelected = selectedRevisions.includes(item);

      // Do not allow adding more than two revisions
      if (selectedRevisions.length == 2) {
        enqueueSnackbar(maxRevisionsError as string, {
          variant: warningVariant,
        });
        return false;
      }

      if (!isSelected) {
        newSelected.push(item);
      } else if (isSelected) {
        enqueueAlreadySelectedAlert(item, warningVariant);
      }

      return true;
    });
    dispatch(setSelectedRevisions(newSelected));
    dispatch(clearCheckedRevisions());
  };

  const replaceSelectedRevision = (prev: Revision) => {
    const newSelected = [...selectedRevisions];
    const newRevision = checkedRevisions[0];
    if (newSelected.includes(newRevision)) {
      enqueueAlreadySelectedAlert(newRevision, warningVariant);
    } else {
      newSelected[newSelected.indexOf(prev)] = newRevision;
    }
    dispatch(setSelectedRevisions(newSelected));
  };

  return { addSelectedRevisions, replaceSelectedRevision };
};

export default useSelectRevision;
