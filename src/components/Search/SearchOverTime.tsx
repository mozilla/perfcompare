import { useEffect, useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import { cssRule } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import { Changeset } from '../../types/state';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

interface SearchProps {
  selectLabel: string;
  searchResults: Changeset[];
  tooltip: string;
  inputPlaceholder: string;
  isEditable: boolean;
}

export default function SearchOverTime({
  selectLabel,
  tooltip,
  inputPlaceholder,
  isEditable,
  searchResults,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);
  const [displayDropdown, setDisplayDropdown] = useState(false);
  //temporary until next PR covers selected revisions
  const handleSearchResultsEditToggle = (item: Changeset) => {
    console.log('handleSearchResultsEditToggle', item);
  };

  const displayedRevisions: Changeset[] = [];

  /* These overriding rules update the theme mode by accessing the otherwise inaccessible MUI tooltip styles */
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

  useEffect(() => {
    const handleEscKeypress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDisplayDropdown(false);
      }
    };

    const handleDocumentMousedown = (e: MouseEvent) => {
      if (!displayDropdown) {
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest('.new-search-input--time') === null) {
        // Close the dropdown only if the click is outside the search input or one
        // of it's descendants.
        setDisplayDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscKeypress);
    document.addEventListener('mousedown', handleDocumentMousedown);

    return () => {
      document.removeEventListener('keydown', handleEscKeypress);
      document.removeEventListener('mousedown', handleDocumentMousedown);
    };
  }, [displayDropdown]);

  return (
    <Grid className={styles.component}>
      <Grid
        item
        xs={2}
        className={`$new-search-dropdown ${styles.dropDown} label-edit-wrapper`}
      >
        <InputLabel
          id='select-repository-label--time'
          className='dropdown-select-label'
        >
          {selectLabel}
          <Tooltip placement='top' title={tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
      </Grid>
      {/**** Search - DropDown Section ****/}
      <Grid
        container
        alignItems='flex-start'
        id='new-search-container--time'
        className={`${styles.container}`}
      >
        <Grid
          item
          xs={2}
          id='new_search-dropdown--time'
          className={`new-search-dropdown ${styles.dropDown} ${
            isEditable ? 'small' : ''
          } ${isEditable ? compareView : ''}-base-dropdown`}
        >
          <SearchDropdown
            compact={false}
            selectLabel={selectLabel}
            tooltipText={tooltip}
            searchType='new'
          />
        </Grid>
        <Grid
          item
          xs={7}
          id='new_search-input--time'
          className={`new-search-input--time  ${styles.baseSearchInput} ${
            isEditable ? 'big' : ''
          } `}
        >
          <SearchInput
            onFocus={() => setDisplayDropdown(true)}
            compact={false}
            inputPlaceholder={inputPlaceholder}
            searchType='new'
          />
          {searchResults.length > 0 && displayDropdown && (
            <SearchResultsList
              hasNonEditableState={isEditable}
              isBase={false}
              searchResults={searchResults}
              displayedRevisions={displayedRevisions}
              onToggle={handleSearchResultsEditToggle}
            />
          )}
        </Grid>
      </Grid>
      {/***** Selected Revisions Section *****/}
      {/** This section will be handled in a revisions PR */}
    </Grid>
  );
}
