import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

import { RootState } from '../../common/store';
import { useAppDispatch } from '../../hooks/app';
import useSelectRevision from '../../hooks/useSelectRevision';
import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import type { Revision } from '../../types/state';
import AddRevisionButton from '../Search/AddRevisionButton';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';
import { Box } from '@mui/material';

function RevisionSearch(props: RevisionSearchProps) {
  const [focused, setFocused] = useState(false);
  const { prevRevision, searchResults, setPopoverIsOpen, view } = props;

  const dispatch = useAppDispatch();
  const { replaceSelectedRevision } = useSelectRevision();

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(
        `#revision-search-container, 
        #revision-search-container *`,
      ) &&
      // do not open search results when dropdown or cancel button is clicked
      !(e.target as HTMLElement).matches(
        `#revision-search-dropdown,
        #revision-search-dropdown *,
        #cancel-edit-revision-button, 
        #cancel-edit-revision-button *`,
      )
    ) {
      setFocused(true);
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

  const endAdornmentComponent = () => {
    return (
      <Grid item md={1} xs={1} lg={1}>
        <Box px={1}>
        {view == 'search' && <AddRevisionButton setFocused={setFocused} />}
        {view == 'compare-results' && setPopoverIsOpen && prevRevision && (
          <>
            {/* TODO: add functionality for buttons and improve styling */}
            <Button
              className="edit-revision-button"
              id="replace-revision-button"
              data-testid="replace-revision-button"
              size="small"
              onClick={() => replaceSelectedRevision(prevRevision)}
            >
              <CheckIcon className="accept" />
            </Button>
            <Button
              className="edit-revision-button"
              id="cancel-edit-revision-button"
              data-testid="cancel-edit-revision-button"
              size="small"
              onClick={() => setPopoverIsOpen(false)}
            >
              <CloseIcon className="cancel" />
            </Button>
          </>
        )}
        </Box>
      </Grid>
    );
  };

  return (
    <Grid
      container
      flexDirection={'row'}
      alignItems="flex-start"
      justifyContent="center"
      id="revision-search-container"
    >
      <Grid item md={2} lg={2} xs={12} id="revision-search-dropdown">
        <Box>
          <SearchDropdown view={view} />
        </Box>
      </Grid>
      <Grid item md={9} lg={9} xs={9}>
        <Box>
          <SearchInput setFocused={setFocused} view={view} />
        </Box>
      </Grid>
      <Grid item md={1} xs={3} lg={1}>
        {view == 'search' && <AddRevisionButton setFocused={setFocused} />}
        {view == 'compare-results' && setPopoverIsOpen && prevRevision && (
          <>
            {/* TODO: add functionality for buttons and improve styling */}
            <Button
              className="edit-revision-button"
              id="replace-revision-button"
              data-testid="replace-revision-button"
              size="small"
              onClick={() => replaceSelectedRevision(prevRevision)}
            >
              <CheckIcon className="accept" />
            </Button>
            <Button
              className="edit-revision-button"
              id="cancel-edit-revision-button"
              data-testid="cancel-edit-revision-button"
              size="small"
              onClick={() => setPopoverIsOpen(false)}
            >
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
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: Revision;
}

function mapStateToProps(state: RootState) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(RevisionSearch);
