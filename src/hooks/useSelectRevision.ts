import { useSnackbar, VariantType } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';

import { maxRevisionsError } from '../common/constants';
import type { RootState } from '../common/store';
import { clearCheckedRevisions } from '../reducers/CheckedRevisions';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import { truncateHash } from '../utils/helpers';

const useSelectRevision = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const searchResults = useSelector(
    (state: RootState) => state.search.searchResults,
  );

  const checkedRevisions = useSelector(
    (state: RootState) => state.checkedRevisions.revisions,
  );

  const selectedRevisions = useSelector(
    (state: RootState) => state.selectedRevisions.revisions,
  );

  const addSelectedRevisions = () => {
    const newSelected = [...selectedRevisions];
    const variant: VariantType = 'warning';

    checkedRevisions.every((item) => {
      const revision = searchResults[item];
      const isSelected = selectedRevisions.includes(revision);

      // Do not allow adding more than four revisions
      if (selectedRevisions.length == 4) {
        enqueueSnackbar(maxRevisionsError, { variant });
        return false;
      }

      if (!isSelected) {
        newSelected.push(revision);
      } else if (isSelected) {
        enqueueSnackbar(
          `Revision ${truncateHash(revision.revision)} is already selected.`,
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
