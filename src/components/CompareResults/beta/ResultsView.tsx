import Grid from '@mui/material/Grid';
import { Container } from '@mui/system';

import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import InputsReplacement from './InputsReplacement';
import ResultsMain from './ResultsMain';

function ResultsView() {
  return (
    <Container maxWidth='xl' data-testid='beta-version-compare-results'>
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={10}>
          <InputsReplacement />
        </Grid>
        <Grid item xs={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </Container>
  );
}

export default ResultsView;
