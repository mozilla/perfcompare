import React from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

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
  const { focused, handleParentClick, handleFocus, handleChildClick } =
    useFocusInput();

  const { searchResults, selectedRevisions } = props;

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
          <Grid item xs={10} sx={{ zIndex: 2 }}>
            {searchResults.length > 0 && focused && (
              <SearchResultsList handleChildClick={handleChildClick} />
            )}
          </Grid>
          <Grid item xs={1} />
        </Grid>
        <Grid item xs={12}>
          {selectedRevisions.length > 0 && <SelectedRevisionsTable />}
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
