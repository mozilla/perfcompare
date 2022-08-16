import { useSnackbar, VariantType } from 'notistack';

import { maxRevisionsError } from '../common/constants';
import { clearCheckedRevisions } from '../reducers/CheckedRevisions';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
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

  const addSelectedRevisions = () => {
    const newSelected = [...selectedRevisions];
    const variant: VariantType = 'warning';

    checkedRevisions.every((item) => {
      const isSelected = selectedRevisions.includes(item);

      // Do not allow adding more than four revisions
      if (selectedRevisions.length == 4) {
        enqueueSnackbar(maxRevisionsError, { variant });
        return false;
      }

      if (!isSelected) {
        newSelected.push(item);
      } else if (isSelected) {
        enqueueSnackbar(
          `Revision ${truncateHash(item.revision)} is already selected.`,
          {
            variant,
          },
        );
      }

      return true;
    });
    dispatch(setSelectedRevisions(newSelected));
    dispatch(clearCheckedRevisions());
  };

  return { addSelectedRevisions };
};

export default useSelectRevision;
