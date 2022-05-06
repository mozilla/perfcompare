import React from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function AddRevisionButton() {
  return (
    <Grid item xs={2}>
      <Button
        variant="contained"
        sx={{
          fontSize: '1rem',
          height: 'auto',
          width: '100%',
          lineHeight: '1.4375em',
          padding: '16.5px 14px',
        }}
      >
        Add Revision(s)
      </Button>
    </Grid>
  );
}
