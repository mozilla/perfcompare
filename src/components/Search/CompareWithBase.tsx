import { useState } from 'react';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { VariantType, useSnackbar } from 'notistack';
import { Form } from 'react-router';
import { style } from 'typestyle';

import CancelAndCompareButtons from './CancelAndCompareButtons';
import EditButton from './EditButton';
import SearchComponent from './SearchComponent';
import SearchFrameworkDropdown from './SearchFrameworkDropdown';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import type { Changeset, Repository } from '../../types/state';
import { Framework } from '../../types/types';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  hasEditButton: boolean;
  baseRev: Changeset | null;
  newRevs: Changeset[];
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  frameworkIdVal: Framework['id'];
  isExpanded: boolean;
  setIsExpanded?: () => unknown;
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
 *   ResultsView the user will need to press Edit first.
 *   If the user presses "Cancel", the previous non-editable state is
 *   recalled.
 */
function CompareWithBase({
  hasEditButton,
  baseRev,
  newRevs,
  frameworkIdVal,
  baseRepo,
  newRepo,
  isExpanded,
}: CompareWithBaseProps) {
  const { enqueueSnackbar } = useSnackbar();

  // pressing Cancel reverts to committed states.
  // The "committed" base and new revisions initialize the "in progress" state
  // too. These states hold the data that are displayed to the user. They always
  // contain the displayed data. That's also the ones that will be committed if
  // the user presses the "Compare" button.
  const [baseInProgressRev, setInProgressBaseRev] = useState<Changeset | null>(
    baseRev,
  );
  const [newInProgressRevs, setInProgressNewRevs] =
    useState<Changeset[]>(newRevs);
  const [baseRepository, setBaseRepository] = useState(baseRepo);
  const [newRepository, setNewRepository] = useState(newRepo);
  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasEditButton);

  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const hasCancelButton = hasEditButton && formIsDisplayed;

  const isWarning =
    (baseRepository === 'try' && newRepository !== 'try') ||
    (baseRepository !== 'try' && newRepository === 'try');

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${Spacing.Large}px`,
    }),
  };

  const onFormSubmit = (e: React.FormEvent) => {
    const isFormReadyToBeSubmitted = baseInProgressRev !== null;
    setFormIsDisplayed(!isFormReadyToBeSubmitted);

    if (!isFormReadyToBeSubmitted) {
      e.preventDefault();
      enqueueSnackbar(strings.base.collapsed.errors.notEnoughRevisions, {
        variant: 'error',
      });
    }
  };

  const handleCancel = () => {
    setInProgressNewRevs(newRevs);
    setInProgressBaseRev(baseRev);
    setFormIsDisplayed(false);
  };

  const handleEdit = () => {
    setInProgressBaseRev(baseRev);
    setInProgressNewRevs(newRevs);
    setFormIsDisplayed(true);
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

  const expandedClass = isExpanded ? 'expanded' : 'hidden';
  return (
    <div
      className={`compare-card-container content-base content-base--${expandedClass} ${styles.container} wrapper--withbase ${wrapperStyles.wrapper}`}
    >
      <Divider className='divider' />
      <Box
        sx={{
          paddingInline: 6,
          paddingBlockStart: hasEditButton ? 4 : 6,
          paddingBlockEnd: hasEditButton && formIsDisplayed ? 4 : 6,
        }}
      >
        <Form
          action='/compare-results'
          onSubmit={onFormSubmit}
          aria-label='Compare with base form'
          autoComplete='off'
        >
          {/**** Edit Button ****/}
          {hasEditButton && (
            <div
              className={`edit-btn-wrapper ${
                !formIsDisplayed ? 'show-edit-btn' : 'hide-edit-btn'
              }`}
            >
              <EditButton onEditAction={handleEdit} mode={mode} />
            </div>
          )}

          <SearchComponent
            {...stringsBase}
            isBaseComp={true}
            isWarning={isWarning}
            hasEditButton={hasEditButton}
            displayedRevisions={baseInProgressRev ? [baseInProgressRev] : []}
            onSearchResultsToggle={handleSearchResultsToggleBase}
            onRemoveRevision={handleRemoveRevisionBase}
            repository={baseRepository}
            labelIdInfo='repo-dropdown--base'
            onRepositoryChange={(repo: Repository['name']) =>
              setBaseRepository(repo)
            }
            formIsDisplayed={formIsDisplayed}
            listItemComponent='radio'
          />
          <SearchComponent
            {...stringsNew}
            isBaseComp={false}
            hasEditButton={hasEditButton}
            isWarning={isWarning}
            displayedRevisions={newInProgressRevs}
            onSearchResultsToggle={handleSearchResultsToggleNew}
            onRemoveRevision={handleRemoveRevisionNew}
            repository={newRepository}
            labelIdInfo='repo-dropdown--new'
            onRepositoryChange={(repo: Repository['name']) =>
              setNewRepository(repo)
            }
            formIsDisplayed={formIsDisplayed}
          />

          {/* !hasEditButton means we are in Search view
        hasCancelButton means we are in Edit mode on Results view */}
          {(!hasEditButton || hasCancelButton) && (
            <Grid
              className={dropDownStyles.dropDown}
              size={2}
              sx={{
                display: 'flex',
                justifyContent: hasEditButton ? 'flex-end' : 'space-between',
                alignItems: 'flex-end',
              }}
            >
              {!hasEditButton && (
                <SearchFrameworkDropdown frameworkId={frameworkIdVal} />
              )}

              <CancelAndCompareButtons
                label={strings.base.compareBtn}
                onCancel={handleCancel}
                hasCancelButton={hasCancelButton}
                hasEditButton={hasEditButton}
              />
            </Grid>
          )}
          {/**** Hidden Input to capture framework when user updates revisions ****/}
          {hasEditButton && (
            <input
              type='hidden'
              value={frameworkIdVal}
              name='framework'
            ></input>
          )}
        </Form>
      </Box>
    </div>
  );
}

export default CompareWithBase;
