import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { cssRule, style } from 'typestyle';

import { compareOverTimeView, timeRanges } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
  Colors,
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
  formIsDisplayed: boolean;
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
  formIsDisplayed,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);
  const timeRangeStrings =
    Strings.components.searchDefault.overTime.collapsed.timeRange;
  const stringsBase =
    Strings.components.searchDefault.overTime.collapsed.baseRepo;
  const stringsNew =
    Strings.components.searchDefault.overTime.collapsed.revisions;

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

  const timeRangeText = timeRanges.find(
    (entry) => entry.value === timeRangeValue,
  )?.text;

  const readOnlyStyles = style({
    borderRadius: Spacing.xSmall,
    backgroundColor: Colors.Background200,
    padding: `${Spacing.xSmall}px ${Spacing.xSmall}px`,
  });

  return (
    <Grid className={styles.component}>
      {/**** Base - Time-Range Labels ****/}
      <Grid
        container
        spacing={2}
        className={`base-repo-dropdown ${styles.dropDown}`}
      >
        <Grid item xs style={{ maxWidth: '360px' }}>
          <InputLabel
            id='base-repo-dropdown--overtime'
            className='dropdown-select-label dropdown-select-label--base'
          >
            {stringsBase.selectLabelBase}
            <Tooltip placement='top' title={stringsBase.tooltipBase}>
              <InfoIcon fontSize='small' className='dropdown-info-icon' />
            </Tooltip>
          </InputLabel>
        </Grid>

        <Grid item xs ml={3}>
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
      </Grid>

      {/**** Base - TimeRange ReadyOnly ****/}
      {!formIsDisplayed && (
        <Grid
          container
          alignItems='flex-start'
          columnSpacing={2}
          mb={3}
          id='time-search-container--readonly'
          className={styles.container}
          sx={{ p: 0, ml: 0, mb: 2 }}
        >
          <Grid
            item
            xs
            style={{ maxWidth: '360px' }}
            className={`base-search-dropdown ${readOnlyStyles} ${
              styles.dropDown
            }  ${hasEditButton ? 'small' : ''} ${
              hasEditButton ? compareOverTimeView : ''
            }-base-dropdown`}
          >
            <Typography
              component='span'
              variant='body2'
              color='text.primary'
              alignItems='center'
            >
              {baseRepo}
            </Typography>
          </Grid>

          <Grid
            item
            xs
            ml={3}
            className={`new-search-dropdown ${readOnlyStyles}`}
          >
            <Typography
              component='span'
              variant='body2'
              color='text.primary'
              alignItems='center'
            >
              {timeRangeText}
            </Typography>
          </Grid>
        </Grid>
      )}

      {/**** Base - TimeRange DropDowns Section ****/}
      {formIsDisplayed && (
        <Grid
          container
          alignItems='flex-start'
          id='base-time-dropdown-container'
          mb={3}
          p={0}
          ml={0}
          className={`${styles.container}`}
        >
          <Grid
            item
            xs
            style={{ maxWidth: '360px' }}
            id='base_search-dropdown--time'
            className={`base-search-dropdown ${hasEditButton ? 'small' : ''} ${
              hasEditButton ? compareOverTimeView : ''
            }-base-dropdown`}
          >
            <SearchDropdown
              compact={hasEditButton}
              selectLabel={stringsBase.selectLabelBase}
              searchType='base'
              repository={baseRepo}
              labelIdInfo='base-repo-dropdown--overtime'
              onChange={onBaseRepositoryChange}
              name='baseRepo'
            />
          </Grid>

          <Grid
            item
            xs
            id='time-range'
            ml={3}
            className={`new-search-dropdown ${styles.dropDown} `}
          >
            <TimeRangeDropdown
              timeRangeValue={timeRangeValue}
              onChange={onTimeRangeChange}
            />
          </Grid>
        </Grid>
      )}

      {/*** Revision- DropDown Labels Section ***/}
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

      {formIsDisplayed && (
        <Grid
          container
          alignItems='flex-start'
          id='new-search-container--time'
          className={`${styles.container} ${
            formIsDisplayed ? 'show-container--time' : ''
          }`}
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
      )}

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
