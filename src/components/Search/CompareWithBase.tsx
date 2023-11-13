import { useState, useMemo } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { SearchStyles } from '../../styles';
import type { RevisionsList, Repository, InputType } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsNew = Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  isEditable: boolean;
  displayedRevisions: {
    baseRevs: RevisionsList[];
    newRevs: RevisionsList[];
  };
  displayedRepositories: {
    baseRepos: Repository['name'][];
    newRepos: Repository['name'][];
  };
}

function CompareWithBase({
  isEditable,
  displayedRevisions,
  displayedRepositories,
}: CompareWithBaseProps) {
  const [expanded, setExpanded] = useState(true);

  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const search = useAppSelector((state) => state.search);
  const baseRepository = search.base.repository;
  const newRepository = search.new.repository;
  const revisionsAndReposBase = useMemo(() => {
    const revsAndRepos = {
      revisions: displayedRevisions.baseRevs,
      repositories: displayedRepositories.baseRepos,
    };
    return revsAndRepos;
  }, [displayedRevisions.baseRevs, displayedRepositories.baseRepos]);

  const revisionsAndReposNew = useMemo(() => {
    const revsAndRepos = {
      revisions: displayedRevisions.newRevs,
      repositories: displayedRepositories.newRepos,
    };
    return revsAndRepos;
  }, [displayedRevisions.baseRevs, displayedRepositories.baseRepos]);
  const baseSearchProps = {
    ...stringsBase,
    ...revisionsAndReposBase,
    searchType: 'base' as InputType,
  };
  const newSearchProps = {
    ...stringsNew,
    ...revisionsAndReposNew,
    searchType: 'new' as InputType,
  };
  const isWarning =
    (baseRepository === 'try' && newRepository !== 'try') ||
    (baseRepository !== 'try' && newRepository === 'try');

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    }),
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
            isEditable={isEditable}
            isWarning={isWarning}
            {...baseSearchProps}
          />
          <SearchComponent
            isEditable={isEditable}
            isWarning={isWarning}
            {...newSearchProps}
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
