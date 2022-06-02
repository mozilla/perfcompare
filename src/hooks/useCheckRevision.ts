import React from 'react';

import useAlert from './useAlert';
import useFocusInput from './useFocusInput';

const useCheckRevision = () => {
  const { dispatchSetAlert } = useAlert();
  const { handleChildClick } = useFocusInput();
  const [checked, setChecked] = React.useState<string[]>([]);

  const handleToggle = (e: React.MouseEvent) => {
    const revisionID = (e.currentTarget as HTMLElement).id;
    const isChecked = checked.includes(revisionID);
    const newChecked = [...checked];

    // if item is not already checked, add to checked
    if (checked.length < 4 && !isChecked) {
      newChecked.push(revisionID);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(checked.indexOf(revisionID), 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      dispatchSetAlert('Maximum 4 Revisions', 'warning');
    }
    handleChildClick(e);

    setChecked(newChecked);
  };
  return { checked, handleToggle };
};

export default useCheckRevision;
