import { useState } from 'react';

import { Grid } from '@mui/material';
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
import SearchFrameworkDropdown from './SearchFrameworkDropdown';
import SearchOverTime from './SearchOverTime';

const strings = Strings.components.searchDefault;
const stringsOverTime = Strings.components.searchDefault.overTime;

interface CompareWithTimeProps {
  hasEditButton: boolean;
  newRevs: Changeset[] | [];
  frameworkIdVal: Framework['id'];
  intervalValue: TimeRange['value'];
  newRepo: Repository['name'];
  baseRepo: Repository['name'];
  isExpanded: boolean;
  setIsExpanded?: () => unknown;
}

function CompareOverTime({
  hasEditButton,
  newRevs,
  frameworkIdVal,
  intervalValue,
  baseRepo,
  newRepo,
  isExpanded,
}: CompareWithTimeProps) {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const resultsView = location.pathname.includes(compareOverTimeView);

  const [timeRangeValue, setTimeRangeValue] = useState(intervalValue);
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

  const onFormSubmit = (e: React.FormEvent) => {
    const isFormReadyToBeSubmitted = inProgressRevs.length > 0;
    setFormIsDisplayed(!isFormReadyToBeSubmitted);

    if (!isFormReadyToBeSubmitted) {
      e.preventDefault();
      enqueueSnackbar(stringsOverTime.collapsed.errors.notEnoughRevisions, {
        variant: 'error',
      });
    }
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

  const expandedClass = isExpanded ? 'expanded' : 'hidden';
  return (
    <Grid className={`wrapper--overtime ${wrapperStyles.wrapper}`}>
      <div
        className={`compare-card-container content-base content-base--${expandedClass} ${styles.container} `}
      >
        <Divider className='divider' />
        <Form
          action='/compare-over-time-results'
          onSubmit={onFormSubmit}
          className='form-wrapper'
          aria-label='Compare over time form'
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
            display='flex'
            justifyContent={hasEditButton ? 'flex-end' : 'space-between'}
            className={`${dropDownStyles.dropDown}`}
            alignItems='flex-end'
          >
            {!hasEditButton && (
              <SearchFrameworkDropdown frameworkId={frameworkIdVal} />
            )}

            {/**** Hidden Input to capture framework when user updates revisions ****/}
            {hasEditButton && (
              <input
                value={frameworkIdVal}
                name='framework'
                type='hidden'
              ></input>
            )}

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
