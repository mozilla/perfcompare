import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../common/store';
import { clearCheckedRevisions } from '../reducers/CheckedRevisions';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import useAlert from './useAlert';

const useSelectRevision = () => {
  const dispatch = useDispatch();
  const { dispatchSetAlert } = useAlert();

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

    checkedRevisions.forEach((item) => {
      const revision = searchResults[item];
      const isSelected = selectedRevisions.includes(revision);

      // Do not allow adding more than four revisions
      if (selectedRevisions.length < 4 && !isSelected) {
        newSelected.push(revision);
      } else if (isSelected) {
        dispatchSetAlert(
          `Revision ${revision.revision} is already selected.`,
          'warning',
        );
      } else {
        dispatchSetAlert('Maximum four revisions.', 'warning');
      }
    });
    dispatch(setSelectedRevisions(newSelected));
    dispatch(clearCheckedRevisions());
  };

  return { addSelectedRevisions };
};

export default useSelectRevision;
