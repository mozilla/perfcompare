import type { Dispatch, SetStateAction } from 'react';

import Button from '@mui/material/Button';

import useSelectRevision from '../../hooks/useSelectRevision';

export default function AddRevisionButton(props: AddRevisionButtonProps) {
  const { setFocused } = props;
  const { addSelectedRevisions } = useSelectRevision();
  const handleAddRevision = () => {
    addSelectedRevisions();
    setFocused(false);
  };

  return (
    <Button
      id="add-revision-button"
      variant="outlined"
      className="add-revision-button"
      aria-label="add revisions"
      onClick={handleAddRevision}
      fullWidth
      size="small"
    >
      Add to compare
    </Button>
  );
}

interface AddRevisionButtonProps {
  setFocused: Dispatch<SetStateAction<boolean>>;
}
