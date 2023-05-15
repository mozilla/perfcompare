import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  createRef,
} from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';

import { RootState } from '../../../common/store';
import { useAppDispatch } from '../../../hooks/app';
import { useAppSelector } from '../../../hooks/app';
import useSelectRevision from '../../../hooks/useSelectRevision';
import { clearCheckedRevisions } from '../../../reducers/CheckedRevisions';
import { SearchStyles } from '../../../styles';
import type { Revision } from '../../../types/state';
import type { Repository } from '../../../types/state';
import SearchDropdown from '../../Search/beta/SearchDropdown';
import SearchInput from '../../Search/beta/SearchInput';
import SearchResultsList from '../../Search/beta/SearchResultsList';

interface BaseSearchProps {
  mode: 'light' | 'dark';
  view: 'compare-results' | 'search';
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: Revision;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  base: 'base' | 'new';
  repository: Repository['name'];
}

function SearchComponent({
  mode,
  view,
  setPopoverIsOpen,
  prevRevision,
  selectLabel,
  tooltip,
  base,
  inputPlaceholder,
  repository,
}: BaseSearchProps) {
  const [focused, setFocused] = useState(false);
  const dispatch = useAppDispatch();
  const { replaceSelectedRevision } = useSelectRevision();
  const matchesQuery = useMediaQuery('(max-width:768px)');
  const containerRef = createRef<HTMLDivElement>();
  const searchResults = useAppSelector(
    (state: RootState) => state.search.searchResults,
  );
  const baseSearchResults = useAppSelector(
    (state: RootState) => state.search.baseSearchResults,
  );
  const newSearchResults = useAppSelector(
    (state: RootState) => state.search.newSearchResults,
  );
  const searchState = useAppSelector((state: RootState) => state.search);
  const inputErrorBase = searchState.inputErrorBase;
  const inputErrorNew = searchState.inputErrorNew;
  const inputHelperText = searchState.inputHelperText;
  const styles = SearchStyles(mode);

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(`#${base}-search-container, 
      #${base}-search-container *`) &&
      // do not open search results when dropdown or cancel button is clicked
      !(e.target as HTMLElement).matches(
        `#${base}_search-dropdown,
        #${base}_search-dropdown *,
        #cancel-edit-${base}-button, 
        #cancel-edit-${base}-button *`,
      )
    ) {
      setFocused(true);
      return;
    } else {
      setFocused(false);
    }
  };

  const handleEscKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  useEffect(() => {
    if (focused == false) {
      dispatch(clearCheckedRevisions());
    }
  }, [focused]);

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
      id={`${base}-search-container`}
      className={styles.container}
      ref={containerRef}
    >
      <Grid
        item
        xs={2}
        id={`${base}_search-dropdown`}
        className={`${base}-search-dropdown ${styles.dropDown} ${styles.baseSearchDropdown}`}
      >
        <SearchDropdown
          view={view}
          selectLabel={selectLabel}
          tooltipText={tooltip}
          mode={mode}
          base={base}
          repository={repository}
        />
      </Grid>
      <Grid
        item
        xs={7}
        id={`${base}_search-input`}
        className={`${base}-search-input ${
          matchesQuery ? `${base}-search-input--mobile` : ''
        } ${styles.baseSearchInput}`}
      >
        <SearchInput
          mode={mode}
          setFocused={setFocused}
          view={view}
          inputPlaceholder={inputPlaceholder}
          base={base}
          inputError={base === 'base' ? inputErrorBase : inputErrorNew}
          inputHelperText={inputHelperText}
        />
        {searchResults.length > 0 && focused && (
          <SearchResultsList
            mode={mode}
            searchResults={
              base === 'base' ? baseSearchResults : newSearchResults
            }
            view={view}
            base={base}
          />
        )}
      </Grid>

      <Grid item xs={7} className='compare-result-view'>
        {view == 'compare-results' && setPopoverIsOpen && prevRevision && (
          <>
            <Button
              className='edit-base-button'
              id={`replace-${base}-button`}
              data-testid={`replace-${base}-button`}
              size='small'
              onClick={() => replaceSelectedRevision(prevRevision)}
            >
              <CheckIcon className='accept' />
            </Button>
            <Button
              className={`edit-${base}-button`}
              id={`cancel-edit-${base}-button`}
              data-testid={`cancel-edit-${base}-button`}
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

export default SearchComponent;
