import { useEffect, useState } from 'react';

import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import { Form } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import type { Changeset } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  isEditable: boolean;
  baseRevs: Changeset[];
  newRevs: Changeset[];
}

interface InProgressState {
  revs: Changeset[];
  isInProgress: boolean;
}

function CompareWithBase({
  isEditable,
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

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${Spacing.Large}px`,
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
            isEditable={isEditable}
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
            isEditable={isEditable}
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
            <CompareButton label={strings.base.title} />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
