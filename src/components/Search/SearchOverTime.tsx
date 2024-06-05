/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import { cssRule, style } from 'typestyle';

import { compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import { Changeset, Repository } from '../../types/state';
import { TimeRange } from '../../types/types';
import SearchDropdown from './SearchDropdown';
import SearchInputAndResults from './SearchInputAndResults';
import SelectedRevisions from './SelectedRevisions';
import TimeRangeDropdown from './TimeRangeDropdown';

interface SearchProps {
  hasEditButton: boolean;
  displayedRevisions: Changeset[];
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  timeRangeValue: TimeRange['value'];
  onRemoveRevision: (item: Changeset) => void;
  onSearchResultsToggle: (item: Changeset) => void;
  onBaseRepositoryChange: (repo: Repository['name']) => unknown;
  onNewRepositoryChange: (repo: Repository['name']) => unknown;
  onTimeRangeChange: (val: TimeRange['value']) => unknown;
}

export default function SearchOverTime({
  hasEditButton,
  baseRepo,
  newRepo,
  displayedRevisions,
  timeRangeValue,
  onRemoveRevision,
  onSearchResultsToggle,
  onBaseRepositoryChange,
  onNewRepositoryChange,
  onTimeRangeChange,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);
  const timeRangeStrings =
    Strings.components.searchDefault.overTime.collapsed.timeRange;
  const stringsBase =
    Strings.components.searchDefault.overTime.collapsed.baseRepo;
  const stringsNew =
    Strings.components.searchDefault.overTime.collapsed.revisions;

  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasEditButton);

  const baseRepoStyles = style({
    marginBottom: `${Spacing.Large}px`,
    justifyContent: 'space-between',
    $nest: {
      ' > div': {
        flexGrow: 1,
        maxWidth: '360px',
      },
    },
  });

  const baseTimeRangeStyles = style({
    display: 'flex',
    justifyContent: 'start',
    $nest: {
      '> label': {
        flexGrow: 1,
      },
    },
  });

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
      {/**** Base - Time-Range Labels ****/}
      <Grid
        item
        xs={5}
        className={`${baseTimeRangeStyles} base-repo-dropdown ${styles.dropDown}`}
      >
        <InputLabel
          id='base-repo-dropdown--overtime'
          className='dropdown-select-label dropdown-select-label--base'
        >
          {stringsBase.selectLabelBase}
          <Tooltip placement='top' title={stringsBase.tooltipBase}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        <InputLabel
          id='select-timerange-label'
          className='dropdown-select-label dropdown-select-label--time'
        >
          {timeRangeStrings.selectLabel}
          <Tooltip placement='top' title={timeRangeStrings.tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
      </Grid>

      {/**** Base - TimeRange DropDown Section ****/}
      <Grid
        container
        alignItems='flex-start'
        id='base-search-container--time'
        className={`${styles.container} ${baseRepoStyles}`}
      >
        <Grid
          item
          xs={6}
          id='base_search-dropdown--time'
          className={`base-search-dropdown ${styles.dropDown} ${
            hasEditButton ? 'small' : ''
          } ${hasEditButton ? compareOverTimeView : ''}-base-dropdown`}
        >
          <SearchDropdown
            compact={hasEditButton}
            selectLabel={stringsBase.selectLabelBase}
            searchType='base'
            repository={baseRepo}
            labelIdInfo='base-repo-dropdown--overtime'
            onChange={onBaseRepositoryChange}
            isOverTimeBase={true}
          />
        </Grid>

        <Grid
          item
          xs={6}
          id='time-range'
          className={`new-search-dropdown ${styles.dropDown} `}
        >
          <TimeRangeDropdown
            timeRangeValue={timeRangeValue}
            onChange={onTimeRangeChange}
          />
        </Grid>
      </Grid>

      {/*** Revision- DropDown Section ***/}
      <Grid item xs={2} className={`new-search-dropdown ${styles.dropDown}`}>
        <InputLabel
          id='repo-dropdown--overtime'
          className='dropdown-select-label'
        >
          {stringsNew.selectLabel}
          <Tooltip placement='top' title={stringsNew.tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
      </Grid>
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
            hasEditButton ? 'small' : ''
          } ${hasEditButton ? compareOverTimeView : ''}-new-dropdown`}
        >
          <SearchDropdown
            compact={hasEditButton}
            selectLabel={stringsNew.selectLabel}
            searchType='new'
            repository={newRepo}
            labelIdInfo='repo-dropdown--overtime'
            onChange={onNewRepositoryChange}
            isOverTimeBase={false}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id='new_search-input--time'
          className={`new-search-input--time  ${styles.baseSearchInput} ${
            hasEditButton ? 'big' : ''
          } `}
        >
          <SearchInputAndResults
            compact={hasEditButton}
            inputPlaceholder={stringsNew.inputPlaceholder}
            displayedRevisions={displayedRevisions}
            searchType='new'
            repository={newRepo}
            onSearchResultsToggle={onSearchResultsToggle}
          />
        </Grid>
      </Grid>
      {/***** Selected Revisions Section *****/}
      {displayedRevisions && (
        <Grid className='d-flex'>
          <SelectedRevisions
            isBase={false}
            canRemoveRevision={!hasEditButton || formIsDisplayed}
            isWarning={false}
            displayedRevisions={displayedRevisions}
            onRemoveRevision={onRemoveRevision}
          />
        </Grid>
      )}
    </Grid>
  );
}
