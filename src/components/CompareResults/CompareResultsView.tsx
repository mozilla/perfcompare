import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

import useFocusInput from '../../hooks/useFocusInput';
import { Revision, State } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import CompareResultsTable from './CompareResultsTable';

function CompareResultsView(props: CompareResultsViewProps) {
  const { revisions } = props;
  const { focused, handleParentClick, handleFocus, handleEscKey } =
    useFocusInput();

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
  });
  return (
    <Container maxWidth="lg" onClick={handleParentClick}>
      <PerfCompareHeader />
      <Grid container>
        <Grid item xs={12}>
          {revisions.length > 0 && (
            <SelectedRevisionsTable
              view="compare-results"
              handleFocus={handleFocus}
              focused={focused}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <CompareResultsTable />
        </Grid>
      </Grid>
    </Container>
  );
}

interface CompareResultsViewProps {
  revisions: Revision[];
}

function mapStateToProps(state: State) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(CompareResultsView);
