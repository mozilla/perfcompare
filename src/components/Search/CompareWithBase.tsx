import { useEffect, useState } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import { Form } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles } from '../../styles';
import type { Changeset } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  hasNonEditableState: boolean;
  baseRevs: Changeset[];
  newRevs: Changeset[];
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
  baseRevs,
  newRevs,
}: CompareWithBaseProps) {
  const [expanded, setExpanded] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  //the "committed" base and new revisions initialize the staging state
  const [baseStagingRevs, setStagingBaseRevs] = useState<Changeset[]>(baseRevs);

  const [newStagingRevs, setStagingNewRevs] = useState<Changeset[]>(newRevs);

  //the edit button will initialize the "in progress" state
  //and copy "stage" to "in progress" state
  const [baseInProgressRevs, setInProgressBaseRevs] = useState<Changeset[]>([]);
  const [baseInProgress, setInProgressBase] = useState(false);

  const [newInProgressRevs, setInProgressNewRevs] = useState<Changeset[]>([]);
  const [newInProgress, setInProgressNew] = useState(false);

  const [displayedRevisionsBaseRevs, setDisplayedRevisionsBaseRevs] =
    useState<Changeset[]>(baseRevs);

  const [displayedRevisionsNewRevs, setDisplayedRevisionsNewRevs] =
    useState<Changeset[]>(newRevs);

  const dispatch = useAppDispatch();

  const mode = useAppSelector((state) => state.theme.mode);

  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const search = useAppSelector((state) => state.search);
  const baseRepository = search.base.repository;
  const newRepository = search.new.repository;
  const searchResultsBase = search.base.searchResults;
  const searchResultsNew = search.new.searchResults;

  const isWarning =
    (baseRepository === 'try' && newRepository !== 'try') ||
    (baseRepository !== 'try' && newRepository === 'try');

  const possiblyPreventFormSubmission = (e: React.FormEvent) => {
    const isFormReadyToBeSubmitted = baseRevs.length > 0;
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

  useEffect(() => {
    setStagingBaseRevs(baseRevs);
    setStagingNewRevs(newRevs);
  }, [baseRevs, newRevs]);

  useEffect(() => {
    if (newInProgress) {
      setDisplayedRevisionsNewRevs(newInProgressRevs);
    } else {
      setDisplayedRevisionsNewRevs(newStagingRevs);
    }

    if (baseInProgress) {
      setDisplayedRevisionsBaseRevs(baseInProgressRevs);
    } else {
      setDisplayedRevisionsBaseRevs(baseStagingRevs);
    }
  }, [
    newInProgress,
    newInProgressRevs,
    newStagingRevs,
    baseInProgress,
    baseInProgressRevs,
    baseStagingRevs,
  ]);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };
  const handleCancelBase = () => {
    setInProgressBaseRevs([]);
    setInProgressBase(false);
    dispatch(clearCheckedRevisionforType({ searchType: 'base' }));
  };

  const handleCancelNew = () => {
    setInProgressNewRevs([]);
    setInProgressNew(false);
    dispatch(clearCheckedRevisionforType({ searchType: 'new' }));
  };

  const handleSaveBase = () => {
    setStagingBaseRevs(baseInProgressRevs);
    handleCancelBase();
  };

  const handleSaveNew = () => {
    setStagingNewRevs(newInProgressRevs);
    handleCancelNew();
  };

  const handleEditBase = () => {
    setInProgressBaseRevs(baseStagingRevs);
    setInProgressBase(true);
  };

  const handleEditNew = () => {
    setInProgressNewRevs(newStagingRevs);
    setInProgressNew(true);
  };

  const handleRemoveRevisionBase = (item: Changeset) => {
    const revisionsBase = [...baseInProgressRevs];
    revisionsBase.splice(baseInProgressRevs.indexOf(item), 1);
    setInProgressBaseRevs(revisionsBase);
  };

  const handleRemoveRevisionNew = (item: Changeset) => {
    const revisionsNew = [...newInProgressRevs];
    revisionsNew.splice(newInProgressRevs.indexOf(item), 1);
    setInProgressNewRevs(revisionsNew);
  };

  const handleSearchResultsToggleBase = (toggleArray: Changeset[]) => {
    setInProgressBaseRevs(toggleArray || []);
    setInProgressBase(true);
  };

  const handleSearchResultsToggleNew = (toggleArray: Changeset[]) => {
    setInProgressNewRevs(toggleArray || []);
    setInProgressNew(true);
  };

  return (
    <Grid className='wrapper'>
      <div
        className={`compare-card-container compare-card-container--${
          expanded ? 'expanded' : 'hidden'
        } ${styles.container}`}
        onClick={toggleIsExpanded}
        data-testid='base-state'
      >
        <div className={`compare-card-text ${styles.cardText}`}>
          <div className='compare-card-title'>{strings.base.title}</div>
          <div className='compare-card-tagline'>{strings.base.tagline}</div>
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
            searchResults={searchResultsBase}
            displayedRevisions={displayedRevisionsBaseRevs}
            onSave={handleSaveBase}
            onCancel={handleCancelBase}
            onEdit={handleEditBase}
            onSearchResultsToggle={handleSearchResultsToggleBase}
            onRemoveRevision={handleRemoveRevisionBase}
          />
          <SearchComponent
            {...stringsNew}
            isBaseComp={false}
            hasNonEditableState={hasNonEditableState}
            isWarning={isWarning}
            searchResults={searchResultsNew}
            displayedRevisions={displayedRevisionsNewRevs}
            onSave={handleSaveNew}
            onCancel={handleCancelNew}
            onEdit={handleEditNew}
            onSearchResultsToggle={handleSearchResultsToggleNew}
            onRemoveRevision={handleRemoveRevisionNew}
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown />
            <CompareButton />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
