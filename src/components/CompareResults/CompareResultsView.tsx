import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Dispatch } from 'redux';

import { setCheckedRevisions } from '../../actions/checkedRevisionsActions';
import type { RootState } from '../../common/store';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { Repository, Revision } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import CompareResultsTable from './CompareResultsTable';

function CompareResultsView(props: CompareResultsViewProps) {
  const { revisions, mode, dispatchSetCheckedRevisions } = props;

  const location = useLocation();
  const { dispatchFetchCompareResults } = useFetchCompareResults();

  // TODO: if the revisions in the URL parameters are different from
  // currently selected revisions, set selected revisions to those parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const repos = searchParams.get('repos')?.split(',');
    const revs = searchParams.get('revs')?.split(',');
    async function fetchCompareResults() {
      await dispatchFetchCompareResults(repos as Repository['name'][], revs);
    }
    void fetchCompareResults();

    // Clear the checked revisions when the revisions prop changes
    dispatchSetCheckedRevisions([]);
  }, [
    revisions,
    location.search,
    dispatchFetchCompareResults,
    dispatchSetCheckedRevisions,
  ]);

  return (
    <Container maxWidth='xl'>
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={10}>
          {revisions.length > 0 && (
            <SelectedRevisionsTable view='compare-results' />
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
  dispatchSetCheckedRevisions: (revisions: Revision[]) => void;
}

function mapStateToProps(state: RootState) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}
function mapDispatchToProps(dispatch: Dispatch) {
  return {
    dispatchSetCheckedRevisions: (revisions: Revision[]) =>
      dispatch(setCheckedRevisions(revisions)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompareResultsView);
