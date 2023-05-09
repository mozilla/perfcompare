import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { connect } from 'react-redux';

import { RootState } from '../../../common/store';
import { useAppDispatch } from '../../../hooks/app';
import useSelectRevision from '../../../hooks/useSelectRevision';
import { clearCheckedRevisions } from '../../../reducers/CheckedRevisions';
import { Strings } from '../../../resources/Strings';
import { SearchStyles } from '../../../styles';
import type { Revision } from '../../../types/state';
import SearchDropdown from '../../Search/beta/SearchDropdown';
import SearchInput from '../../Search/beta/SearchInput';
import SearchResultsList from '../../Search/beta/SearchResultsList';

const strings = Strings.components.searchDefault.base.collapedBase;

function BaseSearch(props: BaseSearchProps) {
  const [focused, setFocused] = useState(false);
  const { mode, searchResults, setPopoverIsOpen, view, prevRevision } = props;
  const dispatch = useAppDispatch();
  const { replaceSelectedRevision } = useSelectRevision();
  const matchesQuery = useMediaQuery('(max-width:768px)');

  const styles = SearchStyles(mode);

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(
        `#base-search-container, 
        #base-search-container *`,
      ) &&
      // do not open search results when dropdown or cancel button is clicked
      !(e.target as HTMLElement).matches(
        `#base_search-dropdown,
        #base_search-dropdown *,
        #cancel-edit-base-button, 
        #cancel-edit-base-button *`,
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
      id='base-search-container'
      className={styles.container}
    >
      <Grid
        item
        xs={2}
        id='base_search-dropdown'
        className={`base-search-dropdown ${styles.dropDown} ${styles.baseSearchDropdown}`}
      >
        <SearchDropdown
          view={view}
          selectLabel={strings.selectLabel}
          tooltipText={strings.tooltip}
          mode={mode}
        />
      </Grid>
      <Grid
        item
        xs={7}
        id='base_search-input'
        className={`base-search-input ${
          matchesQuery ? 'base-search-input--mobile' : ''
        } ${styles.baseSearchInput}`}
      >
        <SearchInput mode={mode} setFocused={setFocused} view={view} />
        {searchResults.length > 0 && focused && (
          <SearchResultsList
            mode={mode}
            searchResults={searchResults}
            view={view}
            base='base'
          />
        )}
      </Grid>

      <Grid item xs={7} className='compare-result-view'>
        {view == 'compare-results' && setPopoverIsOpen && prevRevision && (
          <>
            <Button
              className='edit-base-button'
              id='replace-base-button'
              data-testid='replace-base-button'
              size='small'
              onClick={() => replaceSelectedRevision(prevRevision)}
            >
              <CheckIcon className='accept' />
            </Button>
            <Button
              className='edit-base-button'
              id='cancel-edit-base-button'
              data-testid='cancel-base-revision-button'
              size='small'
              onClick={() => setPopoverIsOpen(false)}
            >
              <CloseIcon className='cancel' />
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );
}

interface BaseSearchProps {
  searchResults: Revision[];
  mode: 'light' | 'dark';
  view: 'compare-results' | 'search';
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: Revision;
}

function mapStateToProps(state: RootState) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(BaseSearch);
