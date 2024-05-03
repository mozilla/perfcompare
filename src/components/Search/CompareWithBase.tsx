import { useState } from 'react';

import { SelectChangeEvent, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { VariantType, useSnackbar } from 'notistack';
import { Form } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import type { Changeset, Repository } from '../../types/state';
import { Framework } from '../../types/types';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  hasNonEditableState: boolean;
  baseRev: Changeset | null;
  newRevs: Changeset[];
  frameworkIdVal: Framework['id'];
}

/**
 * This component implements the form where the user can enter the input to
 * compare some revisions with a base revision.
 * It is fairly complex because it has several states, that also depend on where
 * it's used.
 *
 * In the Search View, the user can edit it always, then presses the
 * "Compare" button to move to the Results View. Pressing the "Compare" button
 * is a normal Form submission, that goes through React Router to change the URL
 * and rerender the page.
 *
 * In the Results View, it is initially displayed as non-editable, but presents
 * an Edit button on each part (base revision / new revisions). When the user
 * presses this Edit button, the corresponding part will move to an editable
 * state, similar to the initial state of the Search View. The user will be
 * able to Cancel or Save the changes, in which case the state moves back to
 * "non-editable" with respectively the previous selections or the new
 * selections being displayed. The user can also presses "Compare" directly to
 * search using the new input.
 *
 * Therefore these 3 different states exist:
 * - The initial state comes from the URL in the ResultsView, and is empty in the
 *   SearchView (aka the Homepage). It is passed to this component with the
 *   props. When the user presses "Compare", the URL changes, and so change the
 *   props too.
 * - The non-editable state (also known as the staging state) is used in the
 *   ResultsView only: it contains the snapshot of the revisions, that the user
 *   will go back if they presses "cancel" after starting editing. It's
 *   initialized with the initial state.
 * - The in-progress state represents the set of revisions that the user is
 *   currently selecting. In the SearchView it can be changed always, but in the
 *   ResultsView the user will need to press Edit first. If the user presses
 *   "Save" at this point, the in-progress state is copied to the non-editable
 *   state. If the user presses "Cancel", the previous non-editable state is
 *   recalled.
 */
function CompareWithBase({
  hasNonEditableState,
  baseRev,
  newRevs,
  frameworkIdVal,
}: CompareWithBaseProps) {
  const [expanded, setExpanded] = useState(true);
  const [frameWorkId, setframeWorkValue] = useState(frameworkIdVal);
  const { enqueueSnackbar } = useSnackbar();

  // The "committed" base and new revisions initialize the staging state.
  // These states are snapshots of selections, that the user can either save (by
  // pressing the "Save" button) or revert to (by pressing the Cancel button).
  const [baseStagingRev, setStagingBaseRev] = useState<Changeset | null>(
    baseRev,
  );
  const [newStagingRevs, setStagingNewRevs] = useState<Changeset[]>(newRevs);

  // The "committed" base and new revisions initialize the "in progress" state
  // too. These states hold the data that are displayed to the user. They always
  // contain the displayed data. That's also the ones that will be committed if
  // the user presses the "Compare" button.
  const [baseInProgressRev, setInProgressBaseRev] = useState<Changeset | null>(
    baseRev,
  );
  const [newInProgressRevs, setInProgressNewRevs] =
    useState<Changeset[]>(newRevs);
  const [baseRepository, setBaseRepository] = useState(
    'try' as Repository['name'],
  );
  const [newRepository, setNewRepository] = useState(
    'try' as Repository['name'],
  );

  const mode = useAppSelector((state) => state.theme.mode);

  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);

  const isWarning =
    (baseRepository === 'try' && newRepository !== 'try') ||
    (baseRepository !== 'try' && newRepository === 'try');

  const possiblyPreventFormSubmission = (e: React.FormEvent) => {
    const isFormReadyToBeSubmitted = baseInProgressRev !== null;
    if (!isFormReadyToBeSubmitted) {
      e.preventDefault();
      enqueueSnackbar(strings.base.collapsed.errors.notEnoughRevisions, {
        variant: 'error',
      });
    }
  };

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }),
  };

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${Spacing.Large}px`,
    }),
  };

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const handleCancelBase = () => {
    setInProgressBaseRev(baseStagingRev);
  };
  const handleCancelNew = () => {
    setInProgressNewRevs(newStagingRevs);
  };

  const handleSaveBase = () => {
    setStagingBaseRev(baseInProgressRev);
  };
  const handleSaveNew = () => {
    setStagingNewRevs(newInProgressRevs);
  };

  const handleEditBase = () => {
    setInProgressBaseRev(baseStagingRev);
  };
  const handleEditNew = () => {
    setInProgressNewRevs(newStagingRevs);
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

  const handleRemoveRevisionBase = (item: Changeset) => {
    // Currently item seems to be the same object than the one stored in
    // baseInProgressRevs, but it might change in the future. That's why we're
    // comparing the ids instead of using indexOf directly.
    if (baseInProgressRev?.id !== item.id) {
      // This shouldn't happen, but better be safe.
      console.error(
        `We tried to remove the base item id ${
          item.id
        }, but current base item is ${
          baseInProgressRev ? baseInProgressRev.id : 'null'
        }. This shouldn't happen!`,
      );
      return;
    }

    setInProgressBaseRev(null);
  };

  const handleRemoveRevisionNew = (item: Changeset) => {
    // Currently item seems to be the same object than the one stored in
    // newInProgressRevs, but it might change in the future. That's why we're
    // comparing the ids instead of using indexOf directly.
    const indexInNewChangesets = newInProgressRevs.findIndex(
      (rev) => rev.id === item.id,
    );
    const revisionsNew = [...newInProgressRevs];
    revisionsNew.splice(indexInNewChangesets, 1);
    setInProgressNewRevs(revisionsNew);
  };

  const handleSearchResultsToggleBase = (item: Changeset) => {
    // Warning: `item` isn't always the same object than the one stored in
    // state, therefore we need to compare the id. This happens when the
    // data in the state comes from the loader, but `item` comes from the
    // search results.
    setInProgressBaseRev(baseInProgressRev?.id === item.id ? null : item);
  };

  const handleSearchResultsToggleNew = (item: Changeset) => {
    const newNewRevs = handleItemToggleInChangesetList({
      item,
      changesets: newInProgressRevs,
    });

    const maxRevisions = 3;
    if (newNewRevs.length > maxRevisions) {
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revisions.`, { variant });
      return;
    }
    // if there are already `maxRevisions` checked revisions, print a warning
    setInProgressNewRevs(newNewRevs);
  };

  return (
    <Grid className={`wrapper--withbase ${wrapperStyles.wrapper}`}>
      <div
        className={`compare-card-container compare-card-container--${
          expanded ? 'expanded' : 'hidden'
        } ${styles.container}`}
        onClick={toggleIsExpanded}
        data-testid='base-state'
      >
        <div className={`compare-card-text ${styles.cardText}`}>
          <Typography variant='h2' className='compare-card-title'>
            {strings.base.title}
          </Typography>
          <p className='compare-card-tagline'>{strings.base.tagline}</p>
        </div>
        <div
          className='compare-card-img compare-card-img--base'
          aria-label='two overlapping circles'
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
          onSubmit={possiblyPreventFormSubmission}
          aria-label='Compare with base form'
        >
          <SearchComponent
            {...stringsBase}
            isBaseComp={true}
            isWarning={isWarning}
            hasNonEditableState={hasNonEditableState}
            displayedRevisions={baseInProgressRev ? [baseInProgressRev] : []}
            onSave={handleSaveBase}
            onCancel={handleCancelBase}
            onEdit={handleEditBase}
            onSearchResultsToggle={handleSearchResultsToggleBase}
            onRemoveRevision={handleRemoveRevisionBase}
            repository={baseRepository}
            labelIdInfo='repo-dropdown--base'
            onRepositoryChange={(repo: Repository['name']) =>
              setBaseRepository(repo)
            }
          />
          <SearchComponent
            {...stringsNew}
            isBaseComp={false}
            hasNonEditableState={hasNonEditableState}
            isWarning={isWarning}
            displayedRevisions={newInProgressRevs}
            onSave={handleSaveNew}
            onCancel={handleCancelNew}
            onEdit={handleEditNew}
            onSearchResultsToggle={handleSearchResultsToggleNew}
            onRemoveRevision={handleRemoveRevisionNew}
            repository={newRepository}
            labelIdInfo='repo-dropdown--new'
            onRepositoryChange={(repo: Repository['name']) =>
              setNewRepository(repo)
            }
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown
              compact={false}
              frameworkId={frameWorkId}
              onChange={(event: SelectChangeEvent) => {
                const id = +event.target.value as Framework['id'];
                setframeWorkValue(id);
              }}
            />
            <CompareButton label={strings.base.title} />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
