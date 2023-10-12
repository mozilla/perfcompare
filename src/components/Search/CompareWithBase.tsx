import { useEffect, useState } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { SearchStyles } from '../../styles';
import type { ThemeMode, RevisionsList, Repository } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';
import { repoMap } from '../../common/constants';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  mode: ThemeMode;
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
  mode,
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

  const handleCancel = (isBase: boolean) => {
    if (isBase) {
      setInProgressBase({ ...revRepos, isInProgress: false });
      dispatch(clearCheckedRevisionforType({ searchType: 'base' }));
    }

    if (!isBase) {
      setInProgressNew({ ...revRepos, isInProgress: false });
      dispatch(clearCheckedRevisionforType({ searchType: 'new' }));
    }
  };

  const handleSave = (isBase: boolean) => {
    if (isBase) {
      setStagingBase(baseInProgress);
      handleCancel(true);
    }

    if (!isBase) {
      setStagingNew(newInProgress);
      handleCancel(false);
    }
  };

  const handleEdit = (isBase: boolean) => {
    if (isBase) {
      setInProgressBase({
        ...baseStaging,
        isInProgress: true,
      });
      handleDisplayedRevisions(true);
    }

    if (!isBase) {
      setInProgressNew({
        ...newStaging,
        isInProgress: true,
      });
      handleDisplayedRevisions(true);
    }
  };

  const handleDisplayedRevisions = (isBase: boolean) => {
    if (isBase) {
      if (baseInProgress.isInProgress) {
        setDisplayedRevisionsBase(baseInProgress);
      } else {
        setDisplayedRevisionsBase(baseStaging);
      }
    }
    if (!isBase) {
      if (newInProgress.isInProgress) {
        setDisplayedRevisionsNew(newInProgress);
      } else {
        setDisplayedRevisionsNew(newStaging);
      }
    }
  };

  const handleRemoveEditViewRevision = (
    isBase: boolean,
    item: RevisionsList,
  ) => {
    const revisionsBase = [...baseInProgress.revs];
    const revisionsNew = [...newInProgress.revs];

    if (isBase) {
      revisionsBase.splice(baseInProgress.revs.indexOf(item), 1);
      setInProgressBase({
        revs: revisionsBase,
        repos: baseInProgress.repos,
        isInProgress: true,
      });
    }

    if (!isBase) {
      revisionsNew.splice(newInProgress.revs.indexOf(item), 1);
      setInProgressNew({
        revs: revisionsNew,
        repos: newInProgress.repos,
        isInProgress: true,
      });
    }
  };

  const handleSearchResultsEditToggle = (
    isBase: boolean,
    toggleArray: RevisionsList[],
  ) => {
    const repos = toggleArray.map((rev) => repoMap[rev.repository_id] ?? 'try');

    if (isBase) {
      setInProgressBase({
        revs: toggleArray || [],
        repos,
        isInProgress: true,
      });
    }

    if (!isBase) {
      setInProgressNew({
        revs: toggleArray || [],
        repos,
        isInProgress: true,
      });
    }
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
            mode={mode}
            isBaseComp={true}
            isWarning={isWarning}
            isEditable={isEditable}
            searchResults={searchResultsBase}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleEdit={handleEdit}
            handleSearchResultsEditToggle={handleSearchResultsEditToggle}
            handleRemoveEditViewRevision={handleRemoveEditViewRevision}
            displayedRevisions={displayedRevisionsBase}
          />
          <SearchComponent
            {...stringsNew}
            isBaseComp={false}
            isEditable={isEditable}
            isWarning={isWarning}
            searchResults={searchResultsNew}
            mode={mode}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleEdit={handleEdit}
            handleSearchResultsEditToggle={handleSearchResultsEditToggle}
            handleRemoveEditViewRevision={handleRemoveEditViewRevision}
            displayedRevisions={displayedRevisionsNew}
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown mode={mode} />
            <CompareButton mode={mode} />
          </Grid>
        </div>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
