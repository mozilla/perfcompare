import React from 'react';

import ArrowForward from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useFocusInput from '../../../hooks/useFocusInput';
import { Revision, State } from '../../../types/state';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import AddRevisionButton from '../AddRevisionButton';
import SearchDropdown from '../SearchDropdown';
import SearchInput from '../SearchInput';
import SearchResultsList from '../SearchResultsList';
import SearchViewInit from '../SearchViewInit';
import SelectedRevisionsTable from '../SelectedRevisionsTable/SelectedRevisionsTable';

import './SearchView.css';

function SearchView(props: SearchViewProps) {
  const { focused, handleParentClick, handleFocus, handleChildClick } =
    useFocusInput();
  const navigate = useNavigate();

  const { searchResults, selectedRevisions } = props;

  const goToResultsPage = () => {
    navigate('/results', { replace: false });
  };
  return (
    <Container maxWidth="lg" onClick={handleParentClick}>
      {/* Component to fetch recent revisions on mount */}
      <SearchViewInit />
      <PerfCompareHeader />
      <Grid container>
        <Grid item xs={1} />
        <SearchDropdown />
        <SearchInput handleFocus={handleFocus} />
        {/* TODO: add behavior for Add Revision button */}
        <AddRevisionButton />
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            {searchResults.length > 0 && focused && (
              <SearchResultsList handleChildClick={handleChildClick} />
            )}
          </Grid>
          <Grid item xs={1} />
        </Grid>
        <Grid item xs={12}>
          {selectedRevisions.length > 0 && <SelectedRevisionsTable />}
        </Grid>

        <Grid item xs={13} className="compare-button-section">
          <Button
            className="compareButton"
            variant="contained"
            onClick={goToResultsPage}
          >
            COMPARE
            <ArrowForward />
          </Button>
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
