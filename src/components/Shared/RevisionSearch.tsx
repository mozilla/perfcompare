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
  const { inputWidth, resultsWidth, searchResults, view } = props;
  const dispatch = useDispatch();

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
    <>
      <Grid container className={view}>
        {view == 'search' && <Grid item xs={1} className="spacer" />}
        <Grid item xs={2}>
          <SearchDropdown />
        </Grid>
        <Grid item xs={inputWidth}>
          <SearchInput setFocused={setFocused} />
        </Grid>

        <Grid item xs={1}>
          {view == 'search' && <AddRevisionButton setFocused={setFocused} />}
          {view == 'compare-results' && (
            <>
              {/* TODO: add functionality for buttons and improve styling */}
              <Button sx={{ padding: 'none' }}>
                <CheckBoxIcon />
              </Button>
              <Button sx={{ padding: 'none' }}>
                <CloseIcon />
              </Button>
            </>
          )}
        </Grid>
      </Grid>
      <Grid container>
        {view == 'search' && <Grid item xs={1} className="spacer" />}
        <Grid item xs={resultsWidth}>
          {searchResults.length > 0 && focused && (
            <SearchResultsList view={view} searchResults={searchResults} />
          )}
        </Grid>
      </Grid>
    </>
  );
}

interface RevisionSearchProps {
  inputWidth: number;
  resultsWidth: number;
  searchResults: Revision[];
  view: 'compare-results' | 'search';
}

function mapStateToProps(state: State) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(RevisionSearch);
