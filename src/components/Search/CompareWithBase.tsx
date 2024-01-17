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
import CompareBaseContext from './CompareWithBaseContext';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

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

  //the search results will handle changes to in progress state

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

  const compareBaseValues = {
    mode,
    isEditable,
    isWarning,
    baseStaging,
    newStaging,
    baseInProgress,
    newInProgress,
    setInProgressBase,
    setInProgressNew,
    setStagingBase,
    setStagingNew,
  };

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }),
  };

  //create search base props
  const searchBaseProps = {
    mode,
    isEditable,
    isWarning,
    staging: baseStaging,
    inProgress: baseInProgress,
    isBase: true,
    searchResults: searchResultsBase,
    setInProgress: setInProgressBase,
    setStaging: setStagingBase,
  };

  //create search new props
  const searchNewProps = {
    mode,
    isEditable,
    isWarning,
    staging: newStaging,
    inProgress: newInProgress,
    isBase: false,
    searchResults: searchResultsNew,
    setInProgress: setInProgressNew,
    setStaging: setStagingNew,
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

  const handleEditBase = () => {
    setInProgressBase({
      ...baseStaging,
      isInProgress: true,
    });
  };

  const handleEditNew = () => {
    setInProgressNew({
      ...newStaging,
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
        <CompareBaseContext.Provider value={compareBaseValues}>
          <div className='form-wrapper'>
            <SearchComponent
              {...stringsBase}
              {...searchBaseProps}
              handleSave={handleSaveBase}
              handleCancel={handleCancelBase}
              handleEdit={handleEditBase}
            />
            <SearchComponent
              {...stringsNew}
              {...searchNewProps}
              handleSave={handleSaveNew}
              handleCancel={handleCancelNew}
              handleEdit={handleEditNew}
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
        </CompareBaseContext.Provider>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
