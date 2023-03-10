import { useSnackbar, VariantType } from 'notistack';

import { setCheckedRevisions } from '../reducers/CheckedRevisions';
import { Revision } from '../types/state';
import { useAppDispatch, useAppSelector } from './app';

const useCheckRevision = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const checkedRevisions: Revision[] = useAppSelector(
    (state) => state.checkedRevisions.revisions,
  );
  console.log('first checkedRevision');
console.log(checkedRevisions);
          
  const handleToggle = (revision: Revision, maxRevisions: number) => {
    const isChecked = checkedRevisions.includes(revision);
    const newChecked = [...checkedRevisions];
 
    console.log('I am newChecked');
   console.log(newChecked);
   console.log('I am checkedRevisison');
   console.log(checkedRevisions);
    // if item is not already checked, add to checked
    //if the checkedRevisions have a size of 3 and the selected item is not yet ticked or added to the ques for comparison
    if (checkedRevisions.length < maxRevisions && !isChecked) {
      newChecked.push(revision);
      console.log(newChecked);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(checkedRevisions.indexOf(revision), 1);
      console.log(newChecked);
      
    } else {
      // if there are already 4 checked revisions, print a warning
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revision(s).`, { variant });
    }
   //newChecked containt only the checked revisions and it's size is less than 4
    dispatch(setCheckedRevisions(newChecked));
  };
  return { checkedRevisions, handleToggle };
};

export default useCheckRevision;
