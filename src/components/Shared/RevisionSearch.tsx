import { useEffect, useState } from 'react';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { connect, useDispatch } from 'react-redux';

import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import type { Revision, State } from '../../types/state';
import AddRevisionButton from '../Search/AddRevisionButton';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';

function RevisionSearch(props: RevisionSearchProps) {
  const [focused, setFocused] = useState(false);
  const { searchResults, view } = props;
  const dispatch = useDispatch();

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(
        `#search-revision-input, 
          #search-results-list, 
          #search-results-list *,
          #add-revision-button`,
      )
    ) {
      setFocused(true);
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
    <>
      {view == 'search' && (
        <>
          <Grid container>
            <Grid item xs={1} className="spacer" />
            <Grid item xs={2} className={view}>
              <SearchDropdown />
            </Grid>
            <Grid item xs={7} className="search">
              <SearchInput setFocused={setFocused} />
            </Grid>

            <Grid item xs={1} className={view}>
              <AddRevisionButton setFocused={setFocused} />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={1} className="spacer" />
            <Grid item xs={10}>
              {searchResults.length > 0 && focused && (
                <SearchResultsList
                  view="search"
                  searchResults={searchResults}
                />
              )}
            </Grid>
          </Grid>
        </>
      )}
      {view == 'compare-results' && (
        <>
          <Grid container>
            <Grid item xs={2} className={view}>
              <SearchDropdown />
            </Grid>

            <Grid item xs={9} className="compare-results">
              <SearchInput setFocused={setFocused} />
            </Grid>
            <Grid item xs={1} className={view}>
              {/* TODO: add functionality for buttons and improve styling */}
              <Button sx={{ padding: 'none' }}>
                <CheckBoxIcon />
              </Button>
              <Button sx={{ padding: 'none' }}>
                <CloseIcon />
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              {searchResults.length > 0 && focused && (
                <SearchResultsList
                  data-testid="compare-search-results-list"
                  view="compare-results"
                  searchResults={searchResults.slice(0, 5)}
                />
              )}
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

interface RevisionSearchProps {
  searchResults: Revision[];
  view: 'compare-results' | 'search';
}

function mapStateToProps(state: State) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(RevisionSearch);
