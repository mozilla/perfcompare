import ArrowForward from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { repoMap } from '../../common/constants';
import type { RootState } from '../../common/store';
import { Revision } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import RevisionSearch from '../Shared/RevisionSearch';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import SearchViewInit from './SearchViewInit';

function SearchView(props: SearchViewProps) {
  const navigate = useNavigate();

  const goToCompareResultsPage = (selectedRevisions: Revision[]) => {
    const revs = selectedRevisions.map((rev) => rev.revision);
    const repos = selectedRevisions.map((rev) => repoMap[rev.repository_id]);
    navigate({
      pathname: '/compare-results',
      search: `?revs=${revs.join(',')}&repos=${repos.join(',')}`,
    });
  };

  const { selectedRevisions } = props;

  return (
    <Container maxWidth="lg" className='perfcompare-body'>
      {/* Component to fetch recent revisions on mount */}
      <SearchViewInit />
      <PerfCompareHeader />
      <Grid item xs={12}>
        {selectedRevisions.length > 0 && (
          <SelectedRevisionsTable view="search" />
        )}
      </Grid>
      <Grid item className="compare-button-section">
        {selectedRevisions.length > 0 && (
          <Button
            className="compare-button"
            variant="contained"
            onClick={() => goToCompareResultsPage(selectedRevisions)}
          >
            compare
            <ArrowForward className="compare-icon" />
          </Button>
        )}
      </Grid>
      <RevisionSearch view="search" />
    </Container>
  );
}

interface SearchViewProps {
  searchResults: Revision[];
  selectedRevisions: Revision[];
}

function mapStateToProps(state: RootState) {
  return {
    searchResults: state.search.searchResults,
    selectedRevisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(SearchView);
