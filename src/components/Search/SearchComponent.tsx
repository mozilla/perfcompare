import {
  Dispatch,
  SetStateAction,
  useEffect,
  createRef,
  useState,
} from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { cssRule } from 'typestyle';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SearchStyles } from '../../styles';
import { Spacing, DropDownMenuRaw, DropDownItemRaw } from '../../styles';
import type { RevisionsList, InputType, ModeType } from '../../types/state';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  mode: ModeType;
  view: 'compare-results' | 'search';
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: RevisionsList;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  searchType: InputType;
  isWarning: boolean;
}

function SearchComponent({
  mode,
  view,
  selectLabel,
  tooltip,
  inputPlaceholder,
  searchType,
  isWarning,
}: SearchProps) {
  cssRule('.MuiPopover-root', {
    $nest: {
      '.MuiPaper-root': {
        flexDirection: 'column',
        ...(mode === 'light' ? DropDownMenuRaw.Light : DropDownMenuRaw.Dark),
        $nest: {
          '.MuiList-root': {
            padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
            $nest: {
              '.MuiMenuItem-root': {
                ...(mode === 'light'
                  ? DropDownItemRaw.Light
                  : DropDownItemRaw.Dark),
              },
            },
          },
        },
      },
    },
  });
  const styles = SearchStyles(mode);
  const checkedRevisionsList = useAppSelector(
    (state: RootState) => state.search[searchType].checkedRevisions,
  );
  const searchState = useAppSelector(
    (state: RootState) => state.search[searchType],
  );
  const selectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions.revisions,
  );

  const { searchResults } = searchState;
  const [focused, setFocused] = useState(false);
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
    }

    setFocused(false);
  };

  const handleEscKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false);
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
    <Grid className={styles.component}>
      {view == 'search' && (
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
            className={`${searchType}-search-dropdown ${styles.dropDown}`}
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
              <SearchResultsList
                mode={mode}
                view={view}
                searchType={searchType}
              />
            )}
          </Grid>
        </Grid>
      )}

      {view == 'compare-results' && (
        <Grid
          item
          xs={2}
          id={`${searchType}_search-dropdown`}
          className={`${searchType}-search-dropdown ${styles.dropDown}`}
        >
          <InputLabel
            id='select-repository-label'
            className='dropdown-select-label'
          >
            {selectLabel}
            <Tooltip placement='top' title={tooltip}>
              <InfoIcon fontSize='small' className='dropdown-info-icon' />
            </Tooltip>
          </InputLabel>
        </Grid>
      )}

      {(checkedRevisionsList.length > 0 ||
        (selectedRevisions && selectedRevisions.length > 0)) && (
        <Grid>
          <SelectedRevisions
            searchType={searchType}
            mode={mode}
            isWarning={isWarning}
            view={view}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default SearchComponent;
