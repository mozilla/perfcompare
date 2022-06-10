import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

import { Revision, State } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import ResultsTable from './ResultsTable';

function ResultsView(props: ResultsViewProps) {
  const { revisions } = props;
  return (
    <Container maxWidth="lg">
      <PerfCompareHeader />
      <Grid container>
        <Grid item xs={12}>
          {revisions.length > 0 && <SelectedRevisionsTable />}
        </Grid>
        <Grid item xs={12}>
          <ResultsTable />
        </Grid>
      </Grid>
    </Container>
  );
}

interface ResultsViewProps {
  revisions: Revision[];
}

function mapStateToProps(state: State) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(ResultsView);
