/* eslint-disable @typescript-eslint/no-unused-vars */
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
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  hasNonEditableState: boolean;
  displayedRevisions: Changeset[];
  repository: Repository['name'];
  onRemoveRevision: (item: Changeset) => void;
  onSearchResultsToggle: (item: Changeset) => void;
  onRepositoryChange: (repo: Repository['name']) => unknown;
}

export default function SearchOverTime({
  selectLabel,
  tooltip,
  inputPlaceholder,
  hasNonEditableState,
  repository,
  displayedRevisions,
  onRemoveRevision,
  onSearchResultsToggle,
  onRepositoryChange,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);

  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasNonEditableState);

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
        className={`new-search-dropdown ${styles.dropDown} label-edit-wrapper`}
      >
        <InputLabel
          id='repo-dropdown--overtime'
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
            hasNonEditableState ? 'small' : ''
          } ${hasNonEditableState ? compareView : ''}-new-dropdown`}
        >
          <SearchDropdown
            compact={false}
            selectLabel={selectLabel}
            searchType='new'
            repository={repository}
            labelIdInfo='repo-dropdown--overtime'
            onChange={onRepositoryChange}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id='new_search-input--time'
          className={`new-search-input--time  ${styles.baseSearchInput} ${
            hasNonEditableState ? 'big' : ''
          } `}
        >
          <SearchInputAndResults
            compact={hasNonEditableState}
            inputPlaceholder={inputPlaceholder}
            displayedRevisions={displayedRevisions}
            searchType='new'
            repository={repository}
            onSearchResultsToggle={onSearchResultsToggle}
          />
        </Grid>
      </Grid>
      {/***** Selected Revisions Section *****/}
      {displayedRevisions && (
        <Grid className='d-flex'>
          <SelectedRevisions
            isBase={false}
            canRemoveRevision={!hasNonEditableState || formIsDisplayed}
            isWarning={false}
            displayedRevisions={displayedRevisions}
            onRemoveRevision={onRemoveRevision}
          />
        </Grid>
      )}
    </Grid>
  );
}
