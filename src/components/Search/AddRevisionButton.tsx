import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function AddRevisionButton() {
  return (
    <Grid item>
      <Button
        variant="contained"
        className="add-revision-button"
        aria-label="add revisions"
      >
        <AddIcon />
      </Button>
    </Grid>
  );
}
