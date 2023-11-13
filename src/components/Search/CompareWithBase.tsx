import { useState } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { Form } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { SearchStyles } from '../../styles';
import type { ThemeMode, RevisionsList, Repository } from '../../types/state';
import CompareButton from './CompareButton';
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

function CompareWithBase({
  mode,
  isEditable,
  baseRevs,
  newRevs,
  baseRepos,
  newRepos,
}: CompareWithBaseProps) {
  const [expanded, setExpanded] = useState(true);

  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const search = useAppSelector((state) => state.search);
  const baseRepository = search.base.repository;
  const newRepository = search.new.repository;
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
        <Form action='/compare-results' className='form-wrapper'>
          <SearchComponent
            searchType='base'
            isEditable={isEditable}
            isWarning={isWarning}
            mode={mode}
            revisions={baseRevs}
            repositories={baseRepos}
            {...stringsBase}
          />
          <SearchComponent
            searchType='new'
            isEditable={isEditable}
            isWarning={isWarning}
            mode={mode}
            revisions={newRevs}
            repositories={newRepos}
            {...stringsNew}
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown mode={mode} />
            <CompareButton mode={mode} />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
