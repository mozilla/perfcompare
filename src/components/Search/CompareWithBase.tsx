import { useEffect, useState } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { repoMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles } from '../../styles';
import type { RevisionsList, Repository } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  isEditable: boolean;
  baseRevs: RevisionsList[];
  newRevs: RevisionsList[];
  baseRepos: Repository['name'][];
  newRepos: Repository['name'][];
}

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

interface InProgressState {
  revs: RevisionsList[];
  repos: Repository['name'][];
  isInProgress: boolean;
}

function CompareWithBase({
  isEditable,
  baseRevs,
  newRevs,
  baseRepos,
  newRepos,
}: CompareWithBaseProps) {
  const [expanded, setExpanded] = useState(true);

  //the "committed" base and new revisions initialize the staging state
  const [baseStaging, setStagingBase] = useState<RevisionsState>({
    revs: baseRevs,
    repos: baseRepos,
  });

  const [newStaging, setStagingNew] = useState<RevisionsState>({
    revs: newRevs,
    repos: newRepos,
  });

  //the edit button will initialize the "in progress" state
  //and copy "stage" to "in progress" state
  const [baseInProgress, setInProgressBase] = useState<InProgressState>({
    revs: [],
    repos: [],
    isInProgress: false,
  });

  const [newInProgress, setInProgressNew] = useState<InProgressState>({
    revs: [],
    repos: [],
    isInProgress: false,
  });

  const [displayedRevisionsBase, setDisplayedRevisionsBase] =
    useState<RevisionsState>({
      revs: baseRevs,
      repos: baseRepos,
    });

  const [displayedRevisionsNew, setDisplayedRevisionsNew] =
    useState<RevisionsState>({
      revs: newRevs,
      repos: newRepos,
    });

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

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }),
  };

  const revRepos = {
    revs: [],
    repos: [],
  };

  useEffect(() => {
    setStagingBase({
      revs: baseRevs,
      repos: baseRepos,
    });
    setStagingNew({
      revs: newRevs,
      repos: newRepos,
    });
  }, [baseRevs, newRevs]);

  useEffect(() => {
    if (newInProgress.isInProgress) {
      setDisplayedRevisionsNew(newInProgress);
    } else {
      setDisplayedRevisionsNew(newStaging);
    }

    if (baseInProgress.isInProgress) {
      setDisplayedRevisionsBase(baseInProgress);
    } else {
      setDisplayedRevisionsBase(baseStaging);
    }
  }, [newInProgress, newStaging, baseInProgress, baseStaging]);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };
  const handleCancelBase = () => {
    setInProgressBase({ ...revRepos, isInProgress: false });
    dispatch(clearCheckedRevisionforType({ searchType: 'base' }));
  };

  const handleCancelNew = () => {
    setInProgressNew({ ...revRepos, isInProgress: false });
    dispatch(clearCheckedRevisionforType({ searchType: 'new' }));
  };

  const handleSaveBase = () => {
    setStagingBase(baseInProgress);
    handleCancelBase();
  };

  const handleSaveNew = () => {
    setStagingNew(newInProgress);
    handleCancelNew();
  };

  const handleDisplayedRevisionsBase = () => {
    if (baseInProgress.isInProgress) {
      setDisplayedRevisionsBase(baseInProgress);
    } else {
      setDisplayedRevisionsBase(baseStaging);
    }
  };

  const handleDisplayedRevisionsNew = () => {
    if (newInProgress.isInProgress) {
      setDisplayedRevisionsNew(newInProgress);
    } else {
      setDisplayedRevisionsNew(newStaging);
    }
  };

  const handleEditBase = () => {
    setInProgressBase({
      ...baseStaging,
      isInProgress: true,
    });
    handleDisplayedRevisionsBase();
  };

  const handleEditNew = () => {
    setInProgressNew({
      ...newStaging,
      isInProgress: true,
    });
    handleDisplayedRevisionsNew();
  };

  const handleRemoveEditViewRevisionBase = (item: RevisionsList) => {
    const revisionsBase = [...baseInProgress.revs];
    revisionsBase.splice(baseInProgress.revs.indexOf(item), 1);
    setInProgressBase({
      revs: revisionsBase,
      repos: baseInProgress.repos,
      isInProgress: true,
    });
  };

  const handleRemoveEditViewRevisionNew = (item: RevisionsList) => {
    const revisionsNew = [...newInProgress.revs];
    revisionsNew.splice(newInProgress.revs.indexOf(item), 1);
    setInProgressNew({
      revs: revisionsNew,
      repos: newInProgress.repos,
      isInProgress: true,
    });
  };

  const handleSearchResultsEditToggleBase = (toggleArray: RevisionsList[]) => {
    const repos = toggleArray.map((rev) => repoMap[rev.repository_id] ?? 'try');
    setInProgressBase({
      revs: toggleArray || [],
      repos,
      isInProgress: true,
    });
  };

  const handleSearchResultsEditToggleNew = (toggleArray: RevisionsList[]) => {
    const repos = toggleArray.map((rev) => repoMap[rev.repository_id] ?? 'try');
    setInProgressNew({
      revs: toggleArray || [],
      repos,
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

        <div className='form-wrapper'>
          <SearchComponent
            {...stringsBase}
            isBaseComp={true}
            isWarning={isWarning}
            isEditable={isEditable}
            searchResults={searchResultsBase}
            displayedRevisions={displayedRevisionsBase}
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
            displayedRevisions={displayedRevisionsNew}
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
        </div>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
