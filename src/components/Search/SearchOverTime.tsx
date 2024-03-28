import { useState } from 'react';

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
import { Changeset, Repository } from '../../types/state';
import SearchDropdown from './SearchDropdown';
import SearchInputAndResults from './SearchInputAndResults';

interface SearchProps {
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  isEditable: boolean;
}

export default function SearchOverTime({
  selectLabel,
  tooltip,
  inputPlaceholder,
  isEditable,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);
  const [repository, setRepository] = useState('try' as Repository['name']);

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
            searchType='new'
            repository={repository}
            onChange={(repo: Repository['name']) => setRepository(repo)}
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
          <SearchInputAndResults
            compact={false}
            inputPlaceholder={inputPlaceholder}
            displayedRevisions={displayedRevisions}
            searchType='new'
            repository={repository}
            onSearchResultsToggle={handleSearchResultsEditToggle}
          />
        </Grid>
      </Grid>
      {/***** Selected Revisions Section *****/}
      {/** This section will be handled in a revisions PR */}
    </Grid>
  );
}
