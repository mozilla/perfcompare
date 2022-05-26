import React from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';

function ResultsView() {
  return (
    <Container maxWidth="lg">
      <PerfCompareHeader />
      <Grid container>
        <Grid item xs={12}>
          <SelectedRevisionsTable />
        </Grid>
      </Grid>
    </Container>
  );
}

export default ResultsView;
