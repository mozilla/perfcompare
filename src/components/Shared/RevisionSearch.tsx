import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { style } from 'typestyle';

import { RootState } from '../../common/store';
import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import useSelectRevision from '../../hooks/useSelectRevision';
import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import { RevisionsList, InputType } from '../../types/state';
import AddRevisionButton from '../Search/AddRevisionButton';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';

const styles = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  container: style({
    maxWidth: '810px',
    marginTop: '48px',
    margin: 'auto',
    position: 'relative',
    justifyContent: 'center',
    $nest: {
      '.revision_search-dropdown': {
        minWidth: '200px',
      },
      '.revision_search-input': {
        maxWidth: '539px',
        position: 'absolute',
        left: '14rem',
        width: '100%',
      },
      '.revision_search-input--mobile': {
        top: '4rem',
        left: '0',
      },
    },
  }),
};

interface RevisionSearchProps {
  searchResults: RevisionsList[];
  view: 'compare-results' | 'search';
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: RevisionsList;
}

function RevisionSearch(props: RevisionSearchProps) {
  const searchType = 'base' as InputType;
  const [focused, setFocused] = useState(false);
  const { prevRevision, setPopoverIsOpen, view } = props;
  const searchState = useAppSelector(
    (state: RootState) => state.search[searchType],
  );
  const { searchResults } = searchState;
  const dispatch = useAppDispatch();
  const { replaceSelectedRevision } = useSelectRevision();
  const matchesQuery = useMediaQuery('(max-width:768px)');

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

  return (
    <Grid
      container
      alignItems='flex-start'
      id='revision-search-container'
      className={styles.container}
    >
      <Grid
        item
        xs={2}
        id='revision-search-dropdown'
        className='revision_search-dropdown'
      >
        <SearchDropdown
          view={view}
          selectLabel='Select Base Revision'
          tooltipText='tooltipText'
          mode='light'
          searchType={searchType}
        />
      </Grid>
      <Grid
        item
        xs={9}
        className={`revision_search-input ${
          matchesQuery ? 'revision_search-input--mobile' : ''
        }`}
      >
        <SearchInput
          inputPlaceholder=''
          searchType={searchType}
          setFocused={setFocused}
          view={view}
          mode='light'
        />
        {searchResults.length > 0 && focused && (
          <SearchResultsList mode='light' view={view} searchType={searchType} />
        )}
        {view == 'search' && searchResults.length > 0 && focused && (
          <AddRevisionButton setFocused={setFocused} />
        )}
      </Grid>

      <Grid item xs={9}>
        {view == 'compare-results' && setPopoverIsOpen && prevRevision && (
          <>
            {/* TODO: add functionality for buttons and improve styling */}
            <Button
              className='edit-revision-button'
              id='replace-revision-button'
              data-testid='replace-revision-button'
              size='small'
              onClick={() => replaceSelectedRevision(prevRevision)}
            >
              <CheckIcon className='accept' />
            </Button>
            <Button
              className='edit-revision-button'
              id='cancel-edit-revision-button'
              data-testid='cancel-edit-revision-button'
              size='small'
              onClick={() => setPopoverIsOpen(false)}
            >
              <CloseIcon className='cancel' />
            </Button>
          </>
        )}
      </Grid>

      <Grid item xs={12} display='none'>
        {searchResults.length > 0 && focused && (
          <SearchResultsList mode='light' view={view} searchType={searchType} />
        )}
      </Grid>
    </Grid>
  );
}

export default RevisionSearch;
