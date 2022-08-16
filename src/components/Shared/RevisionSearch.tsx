import { useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

import { RootState } from '../../common/store';
import { useAppDispatch } from '../../hooks/app';
import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import type { Revision } from '../../types/state';
import AddRevisionButton from '../Search/AddRevisionButton';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';

function RevisionSearch(props: RevisionSearchProps) {
  const [focused, setFocused] = useState(false);
  const { searchResults, view } = props;
  const dispatch = useAppDispatch();

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(
        `#search-revision-input, 
          #search-results-list, 
          #search-results-list *`,
      )
    ) {
      setFocused(true);
    } else if (
      (e.target as HTMLElement).matches(
        '#add-revision-button,#add-revision-button *',
      )
    ) {
      return;
    } else {
      setFocused(false);
      dispatch(clearCheckedRevisions());
    }
  };

  const handleEscKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false);
      dispatch(clearCheckedRevisions());
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleFocus);
    return () => {
      document.removeEventListener('mousedown', handleFocus);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscKeypress);
    };
  });

  return (
    <Grid container alignItems="center" justifyContent="center">
      <Grid item xs={2}>
        <SearchDropdown view={view} />
      </Grid>
      <Grid item xs={9}>
        <SearchInput setFocused={setFocused} view={view} />
      </Grid>

      <Grid item xs={1}>
        {view == 'search' && <AddRevisionButton setFocused={setFocused} />}
        {view == 'compare-results' && (
          <>
            {/* TODO: add functionality for buttons and improve styling */}
            <Button className="edit-revision-button" size="small">
              <CheckIcon className="accept" />
            </Button>
            <Button className="edit-revision-button" size="small">
              <CloseIcon className="cancel" />
            </Button>
          </>
        )}
      </Grid>

      <Grid item xs={12}>
        {searchResults.length > 0 && focused && (
          <SearchResultsList searchResults={searchResults} view={view} />
        )}
      </Grid>
    </Grid>
  );
}

interface RevisionSearchProps {
  searchResults: Revision[];
  view: 'compare-results' | 'search';
}

function mapStateToProps(state: RootState) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(RevisionSearch);
