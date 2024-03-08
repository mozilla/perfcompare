import { updateCheckedRevisions } from '../reducers/SearchSlice';
import { InputType, Changeset } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = (isBase: boolean) => {
  const dispatch = useAppDispatch();
  const searchType: InputType = isBase ? 'base' : 'new';

  const searchCheckedRevisions: Changeset[] = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );

  const removeCheckedRevision = (revision: Changeset) => {
    const newChecked = [...searchCheckedRevisions];
    newChecked.splice(searchCheckedRevisions.indexOf(revision), 1);
    dispatch(updateCheckedRevisions({ newChecked, searchType }));
  };
  return { removeCheckedRevision };
};

export default useCheckRevision;
