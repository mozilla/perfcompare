import { useEffect } from 'react';

import { ArrowForward } from '@mui/icons-material';
import { Button } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useFocusInput from '../../hooks/useFocusInput';
import { Revision, State } from '../../types/state';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SelectedRevisionsTable from '../Shared/SelectedRevisionsTable';
import AddRevisionButton from './AddRevisionButton';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SearchViewInit from './SearchViewInit';

function SearchView(props: SearchViewProps) {
  const { focused, handleParentClick, handleFocus, handleEscKey } =
    useFocusInput();

  const navigate = useNavigate();
  const goToCompareResultsPage = () => {
    navigate('/compare-results', { replace: false });
  };

  const { searchResults, selectedRevisions } = props;

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
  });

  return (
    <Container maxWidth="lg" onClick={handleParentClick}>
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
            onClick={goToCompareResultsPage}
          >
            compare
            <ArrowForward className="compare-icon" />
          </Button>
        )}
      </Grid>
      <Grid container>
        <Grid item xs={1} />
        <SearchDropdown />
        <SearchInput handleFocus={handleFocus} />
        {/* TODO: add behavior for Add Revision button */}
        <AddRevisionButton />
      </Grid>
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          {searchResults.length > 0 && focused && <SearchResultsList />}
        </Grid>
      </Grid>
    </Container>
  );
}

interface SearchViewProps {
  searchResults: Revision[];
  selectedRevisions: Revision[];
}

function mapStateToProps(state: State) {
  return {
    searchResults: state.search.searchResults,
    selectedRevisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(SearchView);
