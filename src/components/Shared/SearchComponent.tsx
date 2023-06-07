import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  createRef,
} from 'react';

import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';

import { RootState } from '../../common/store';
import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import { SearchStyles } from '../../styles';
import type { RevisionsList, InputType } from '../../types/state';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';

interface SearchProps {
  mode: 'light' | 'dark';
  view: 'compare-results' | 'search';
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: RevisionsList;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  searchType: InputType;
}

function SearchComponent({
  mode,
  view,
  selectLabel,
  tooltip,
  inputPlaceholder,
  searchType,
}: SearchProps) {
  const styles = SearchStyles(mode);
  const searchState = useAppSelector(
    (state: RootState) => state.search[searchType],
  );
  const { searchResults } = searchState;
  const [focused, setFocused] = useState(false);
  const dispatch = useAppDispatch();
  const matchesQuery = useMediaQuery('(max-width:768px)');
  const containerRef = createRef<HTMLDivElement>();

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(`#${searchType}-search-container, 
      #${searchType}-search-container *`) &&
      // do not open search results when dropdown or cancel button is clicked
      !(e.target as HTMLElement).matches(
        `#${searchType}_search-dropdown,
        #${searchType}_search-dropdown *,
        #cancel-edit-${searchType}-button, 
        #cancel-edit-${searchType}-button *`,
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
      id={`${searchType}-search-container`}
      className={styles.container}
      ref={containerRef}
    >
      <Grid
        item
        xs={2}
        id={`${searchType}_search-dropdown`}
        className={`${searchType}-search-dropdown ${styles.dropDown} ${styles.baseSearchDropdown}`}
      >
        <SearchDropdown
          view={view}
          selectLabel={selectLabel}
          tooltipText={tooltip}
          mode={mode}
          searchType={searchType}
        />
      </Grid>
      <Grid
        item
        xs={7}
        id={`${searchType}_search-input`}
        className={`${searchType}-search-input ${
          matchesQuery ? `${searchType}-search-input--mobile` : ''
        } ${styles.baseSearchInput}`}
      >
        <SearchInput
          mode={mode}
          setFocused={setFocused}
          view={view}
          inputPlaceholder={inputPlaceholder}
          searchType={searchType}
        />
        {searchResults.length > 0 && focused && (
          <SearchResultsList mode={mode} view={view} searchType={searchType} />
        )}
      </Grid>
    </Grid>
  );
}

export default SearchComponent;
