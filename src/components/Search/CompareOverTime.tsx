import { useState } from 'react';

import { Grid, SelectChangeEvent, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { VariantType, useSnackbar } from 'notistack';
import { Form } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { style } from 'typestyle';

import { compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import { Changeset, Repository } from '../../types/state';
import { Framework, TimeRange } from '../../types/types';
import CancelAndCompareButtons from './CancelAndCompareButtons';
import EditButton from './EditButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchOverTime from './SearchOverTime';

const strings = Strings.components.searchDefault;
const stringsOverTime = Strings.components.searchDefault.overTime;

interface CompareWithTimeProps {
  hasEditButton: boolean;
  newRevs: Changeset[] | [];
  frameworkIdVal: Framework['id'];
  intervalValue: TimeRange['value'];
  isBaseSearch: null | boolean;
  newRepo: Repository['name'];
  baseRepo: Repository['name'];

  expandBaseComponent: (expanded: boolean) => void;
}

function CompareOverTime({
  hasEditButton,
  newRevs,
  frameworkIdVal,
  intervalValue,
  isBaseSearch,
  baseRepo,
  newRepo,

  expandBaseComponent,
}: CompareWithTimeProps) {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const resultsView = location.pathname.includes(compareOverTimeView);
  const searchView =
    !isBaseSearch && isBaseSearch !== null ? 'expanded' : 'hidden';

  const [timeRangeValue, setTimeRangeValue] = useState(intervalValue);
  const [frameworkId, setframeWorkValue] = useState(frameworkIdVal);
  const [inProgressRevs, setInProgressRevs] = useState<Changeset[] | []>(
    newRevs,
  );
  const [baseRepository, setBaseRepository] = useState(baseRepo);
  const [newRepository, setNewRepository] = useState(newRepo);
  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasEditButton);
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const hasCancelButton = hasEditButton && formIsDisplayed;

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${resultsView ? '0' : Spacing.layoutXLarge}px`,
    }),
  };

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      $nest: {
        '.bottom-dropdowns': {
          display: 'flex',
          minWidth: '580px',
          justifyContent: 'space-between',
        },
      },
    }),
  };

  const onFormSubmit = (e: React.FormEvent) => {
    const isFormReadyToBeSubmitted = inProgressRevs.length > 0;

    if (!isFormReadyToBeSubmitted) {
      e.preventDefault();
      enqueueSnackbar(stringsOverTime.collapsed.errors.notEnoughRevisions, {
        variant: 'error',
      });
    }
  };

  const toggleIsExpanded = () => {
    expandBaseComponent(false);
  };

  const handleCancel = () => {
    setInProgressRevs(newRevs);
    setFormIsDisplayed(false);
  };

  const handleEdit = () => {
    setInProgressRevs(newRevs);
    setFormIsDisplayed(true);
  };

  const handleRemoveRevision = (item: Changeset) => {
    const indexInNewChangesets = inProgressRevs.findIndex(
      (rev) => rev.id === item.id,
    );
    const revisionsNew = [...inProgressRevs];
    revisionsNew.splice(indexInNewChangesets, 1);
    setInProgressRevs(revisionsNew);
  };

  const handleItemToggleInChangesetList = ({
    item,
    changesets,
  }: {
    item: Changeset;
    changesets: Changeset[];
  }) => {
    // Warning: `item` isn't always the same object than the one in
    // `changesets`, therefore we need to compare the id. This happens when the
    // data in `changesets` comes from the loader, but `item` comes from the
    // search results.
    const indexInCheckedChangesets = changesets.findIndex(
      (rev) => rev.id === item.id,
    );
    const isChecked = indexInCheckedChangesets >= 0;
    const newChecked = [...changesets];

    // if item is not already checked, add to checked
    if (!isChecked) {
      newChecked.push(item);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(indexInCheckedChangesets, 1);
    }

    return newChecked;
  };

  const handleSearchResultsToggle = (item: Changeset) => {
    const newNewRevs = handleItemToggleInChangesetList({
      item,
      changesets: inProgressRevs,
    });

    const maxRevisions = 3;
    if (newNewRevs.length > maxRevisions) {
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revisions.`, { variant });
      return;
    }
    // if there are already `maxRevisions` checked revisions, print a warning
    setInProgressRevs(newNewRevs);
  };

  return (
    <Grid className={`wrapper--overtime ${wrapperStyles.wrapper}`}>
      <div
        className={`compare-card-container compare-card-container--${
          resultsView ? 'expanded' : searchView
        } ${styles.container}`}
        onClick={toggleIsExpanded}
        data-testid='time-state'
      >
        <div className={`compare-card-text ${styles.cardText}`}>
          <Typography variant='h2' className='compare-card-title'>
            {strings.overTime.title}
          </Typography>
          <p className='compare-card-tagline'>{strings.overTime.tagline}</p>
        </div>
        <div
          className='compare-card-img compare-card-img--time'
          aria-label='a clock'
        />
      </div>
      <div
        className={`compare-card-container content-base content-base--${
          resultsView ? 'expanded' : searchView
        } ${styles.container} `}
      >
        <Divider className='divider' />
        <Form
          action='/compare-over-time-results'
          onSubmit={onFormSubmit}
          className='form-wrapper'
          aria-label='Compare over time form'
          reloadDocument={hasEditButton ?? true}
        >
          {/**** Edit Button ****/}
          <div
            className={`edit-btn-wrapper ${
              hasEditButton && !formIsDisplayed
                ? 'show-edit-btn'
                : 'hide-edit-btn'
            }`}
          >
            <EditButton onEditAction={handleEdit} mode={mode} />
          </div>

          <SearchOverTime
            hasEditButton={hasEditButton}
            baseRepo={baseRepository}
            newRepo={newRepository}
            displayedRevisions={inProgressRevs}
            formIsDisplayed={formIsDisplayed}
            onRemoveRevision={handleRemoveRevision}
            onSearchResultsToggle={handleSearchResultsToggle}
            onBaseRepositoryChange={(repo: Repository['name']) =>
              setBaseRepository(repo)
            }
            onNewRepositoryChange={(repo: Repository['name']) =>
              setNewRepository(repo)
            }
            timeRangeValue={timeRangeValue}
            onTimeRangeChange={(value: TimeRange['value']) =>
              setTimeRangeValue(value)
            }
          />

          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <div className='bottom-dropdowns'>
              <FrameworkDropdown
                frameworkId={frameworkId}
                onChange={(event: SelectChangeEvent) => {
                  const id = +event.target.value as Framework['id'];
                  setframeWorkValue(id);
                }}
              />
            </div>

            <CancelAndCompareButtons
              label={strings.sharedCollasped.button}
              hasCancelButton={hasCancelButton}
              onCancel={handleCancel}
              hasEditButton={hasEditButton}
            />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareOverTime;
