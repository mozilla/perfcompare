import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import useSelectRevision from '../../hooks/useSelectRevision';

export default function AddRevisionButton() {
  const { addSelectedRevisions } = useSelectRevision();
  return (
    <Grid item>
      <Button
        variant="contained"
        className="add-revision-button"
        aria-label="add revisions"
        onClick={() => addSelectedRevisions()}
      >
        <AddIcon />
      </Button>
    </Grid>
  );
}
