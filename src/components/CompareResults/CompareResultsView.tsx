import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { repoMap } from '../../common/constants';
import type { RootState } from '../../common/store';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { fetchRevisionByID } from '../../thunks/searchThunk';
import { Repository, Revision } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import CompareResultsTable from './CompareResultsTable';
import { fetchSelectedRevisions } from '../../thunks/selectedRevisionsThunk';
import { fetchCompareResults } from '../../thunks/compareResultsThunk';

function CompareResultsView(props: CompareResultsViewProps) {
  const { revisions, mode } = props;

  const dispatch = useAppDispatch();
  const location = useLocation();
  const { dispatchFetchCompareResults, useFetchSelectedRevisions } =
    useFetchCompareResults();

  const { repos, revs } = useParams();

  // TODO: if the revisions in the URL parameters are different from
  // currently selected revisions, set selected revisions to those parameters
  useEffect(() => {
    if (repos && revs) {
      void useFetchSelectedRevisions(repos, revs);
    }
  });

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
