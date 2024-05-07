import { useState } from 'react';

import { Grid, SelectChangeEvent, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { VariantType, useSnackbar } from 'notistack';
import { Form, useLocation } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import { Changeset, Repository } from '../../types/state';
import { Framework, TimeRange } from '../../types/types';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchOverTime from './SearchOverTime';
import TimeRangeDropdown from './TimeRangeDropdown';

const strings = Strings.components.searchDefault;
const stringsNew =
  Strings.components.searchDefault.overTime.collapsed.revisions;

interface CompareWithTimeProps {
  hasNonEditableState: boolean;
  newRevs: Changeset[];
  frameworkIdVal: Framework['id'];
}

function CompareOverTime({
  hasNonEditableState,
  newRevs,
  frameworkIdVal,
}: CompareWithTimeProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(false);
  const [timeRangeValue, setTimeRangeValue] = useState(
    86400 as TimeRange['value'],
  );

  const [frameworkId, setframeWorkValue] = useState(frameworkIdVal);

  const [inProgressRevs, setInProgressRevs] = useState<Changeset[]>(newRevs);
  const [repository, setRepository] = useState('try' as Repository['name']);
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  //temporary hash to hide the component until functionality is complete
  const location = useLocation();
  const hash = location.hash;

  //temporary styles to hide the component based on hash
  const containerStyles = {
    container: style({
      display: hash === '#comparetime' ? 'block' : 'none',
    }),
  };

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${Spacing.layoutXLarge}px`,
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

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };
  const handleRemoveRevision = (item: Changeset) => {
    // Currently item seems to be the same object than the one stored in
    // newInProgressRevs, but it might change in the future. That's why we're
    // comparing the ids instead of using indexOf directly.
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
    <Grid
      className={`wrapper--overtime ${wrapperStyles.wrapper} ${containerStyles.container}`}
    >
      <div
        className={`compare-card-container compare-card-container--${
          expanded ? 'expanded' : 'hidden'
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
          expanded ? 'expanded' : 'hidden'
        } ${styles.container} `}
      >
        <Divider className='divider' />
        <Form
          action='/compare-results'
          className='form-wrapper'
          aria-label='Compare over time form'
        >
          <SearchOverTime
            {...stringsNew}
            hasNonEditableState={hasNonEditableState}
            repository={repository}
            displayedRevisions={inProgressRevs}
            onRemoveRevision={handleRemoveRevision}
            onSearchResultsToggle={handleSearchResultsToggle}
            onRepositoryChange={(repo: Repository['name']) =>
              setRepository(repo)
            }
          />

          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <div className='bottom-dropdowns'>
              <FrameworkDropdown
                compact={true}
                frameworkId={frameworkId}
                onChange={(event: SelectChangeEvent) => {
                  const id = +event.target.value as Framework['id'];
                  setframeWorkValue(id);
                }}
              />
              <TimeRangeDropdown
                timeRangeValue={timeRangeValue}
                onChange={(val: TimeRange['value']) => {
                  setTimeRangeValue(val);
                }}
              />
            </div>

            <CompareButton label={strings.sharedCollasped.button} />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareOverTime;
