import React from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import SelectedRevisionsTable from '../Search/SelectedRevisionsTable/SelectedRevisionsTable';
import PerfCompareHeader from '../Shared/PerfCompareHeader';

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
