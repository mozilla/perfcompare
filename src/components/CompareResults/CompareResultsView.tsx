import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import type { RootState } from '../../common/store';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { Repository, Revision } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import PerfCompareHeaderDescription from '../Shared/PerfCompareHeaderDescription';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import CompareResultsTable from './CompareResultsTable';

function CompareResultsView(props: CompareResultsViewProps) {
  const { revisions, mode } = props;

  const location = useLocation();
  const { dispatchFetchCompareResults } = useFetchCompareResults();

  // TODO: if the revisions in the URL parameters are different from
  // currently selected revisions, set selected revisions to those parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const repos = searchParams.get('repos')?.split(',');
    const revs = searchParams.get('revs')?.split(',');
    void dispatchFetchCompareResults(repos as Repository['name'][], revs);
  });

  return (
    <Container maxWidth="xl">
      <PerfCompareHeader />
      <PerfCompareHeaderDescription />
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={10}>
          {revisions.length > 0 && (
            <SelectedRevisionsTable view="compare-results" />
          )}
        </Grid>
        <Grid item xs={12}>
          <CompareResultsTable mode={mode} />
        </Grid>
      </Grid>
    </Container>
  );
}

interface CompareResultsViewProps {
  revisions: Revision[];
  mode: 'light' | 'dark';
}

function mapStateToProps(state: RootState) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(CompareResultsView);
