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

interface InProgressState {
  revs: Changeset[];
  isInProgress: boolean;
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
  const [baseInProgress, setInProgressBase] = useState<InProgressState>({
    revs: [],
    isInProgress: false,
  });

  const [newInProgress, setInProgressNew] = useState<InProgressState>({
    revs: [],
    isInProgress: false,
  });

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
    if (newInProgress.isInProgress) {
      setDisplayedRevisionsNewRevs(newInProgress.revs);
    } else {
      setDisplayedRevisionsNewRevs(newStagingRevs);
    }

    if (baseInProgress.isInProgress) {
      setDisplayedRevisionsBaseRevs(baseInProgress.revs);
    } else {
      setDisplayedRevisionsBaseRevs(baseStagingRevs);
    }
  }, [
    newInProgress.revs,
    newStagingRevs,
    baseInProgress.revs,
    baseStagingRevs,
  ]);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };
  const handleCancelBase = () => {
    setInProgressBase({ revs: [], isInProgress: false });
    dispatch(clearCheckedRevisionforType({ searchType: 'base' }));
  };

  const handleCancelNew = () => {
    setInProgressNew({ revs: [], isInProgress: false });
    dispatch(clearCheckedRevisionforType({ searchType: 'new' }));
  };

  const handleSaveBase = () => {
    setStagingBaseRevs(baseInProgress.revs);
    handleCancelBase();
  };

  const handleSaveNew = () => {
    setStagingNewRevs(newInProgress.revs);
    handleCancelNew();
  };

  const handleEditBase = () => {
    setInProgressBase({
      revs: baseStagingRevs,
      isInProgress: true,
    });
  };

  const handleEditNew = () => {
    setInProgressNew({
      revs: newStagingRevs,
      isInProgress: true,
    });
  };

  const handleRemoveEditViewRevisionBase = (item: Changeset) => {
    const revisionsBase = [...baseInProgress.revs];
    revisionsBase.splice(baseInProgress.revs.indexOf(item), 1);
    setInProgressBase({
      revs: revisionsBase,
      isInProgress: true,
    });
  };

  const handleRemoveEditViewRevisionNew = (item: Changeset) => {
    const revisionsNew = [...newInProgress.revs];
    revisionsNew.splice(newInProgress.revs.indexOf(item), 1);
    setInProgressNew({
      revs: revisionsNew,
      isInProgress: true,
    });
  };

  const handleSearchResultsEditToggleBase = (toggleArray: Changeset[]) => {
    setInProgressBase({
      revs: toggleArray || [],
      isInProgress: true,
    });
  };

  const handleSearchResultsEditToggleNew = (toggleArray: Changeset[]) => {
    setInProgressNew({
      revs: toggleArray || [],
      isInProgress: true,
    });
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
            handleSave={handleSaveBase}
            handleCancel={handleCancelBase}
            handleEdit={handleEditBase}
            handleSearchResultsEditToggle={handleSearchResultsEditToggleBase}
            handleRemoveEditViewRevision={handleRemoveEditViewRevisionBase}
          />
          <SearchComponent
            {...stringsNew}
            isBaseComp={false}
            hasNonEditableState={hasNonEditableState}
            isWarning={isWarning}
            searchResults={searchResultsNew}
            displayedRevisions={displayedRevisionsNewRevs}
            handleSave={handleSaveNew}
            handleCancel={handleCancelNew}
            handleEdit={handleEditNew}
            handleSearchResultsEditToggle={handleSearchResultsEditToggleNew}
            handleRemoveEditViewRevision={handleRemoveEditViewRevisionNew}
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
