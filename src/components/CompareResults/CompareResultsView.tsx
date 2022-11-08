import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { repoMap } from '../../common/constants';
import type { RootState } from '../../common/store';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { fetchCompareResults } from '../../thunks/compareResultsThunk';
import { fetchRevisionByID } from '../../thunks/searchThunk';
import { fetchSelectedRevisions } from '../../thunks/selectedRevisionsThunk';
import { Repository, Revision } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import CompareResultsTable from './CompareResultsTable';

function CompareResultsView(props: CompareResultsViewProps) {
  const { revisions, mode } = props;

  const dispatch = useAppDispatch();
  const location = useLocation();
  const { dispatchFetchCompareResults, useFetchSelectedRevisions } =
    useFetchCompareResults();

  return (
    <Container maxWidth="xl">
      <PerfCompareHeader />
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
