import Grid from '@mui/material/Grid';
import { Container } from '@mui/system';

import PerfCompareHeader from '../../Shared/PerfCompareHeader';

function CompareResultsViewBeta() {
  return (
    <Container maxWidth='xl' data-testid='beta-version-compare-results'>
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={10}>
          {/* TODO PCF-223 */}
          Beta version
        </Grid>
        <Grid item xs={12} />
      </Grid>
    </Container>
  );
}

export default CompareResultsViewBeta;
