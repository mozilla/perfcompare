import React from 'react';

import useFocusInput from './useFocusInput';

const useCheckRevision = () => {
  const { handleChildClick } = useFocusInput();
  const [checked, setChecked] = React.useState<string[]>([]);

  const handleToggle = (e: React.MouseEvent) => {
    const revisionID = (e.currentTarget as HTMLElement).id;
    const currentIndex = checked.indexOf(revisionID);
    const newChecked = [...checked];

    handleChildClick(e);

    if (checked.length < 4) {
      // if item is not already checked, add to checked
      if (currentIndex === -1) newChecked.push(revisionID);
      // if item is already checked, remove from checked
      else newChecked.splice(currentIndex, 1);
    } else {
      // if there are already 4 checked revisions, print a warning
      // TODO: replace with pop up notification
      console.log('maximum four revisions');
    }

    setChecked(newChecked);
  };
  return { checked, handleToggle };
};

export default useCheckRevision;
