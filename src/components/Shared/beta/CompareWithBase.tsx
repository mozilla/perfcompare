import { useState } from 'react';

import Divider from '@mui/material/Divider';

import { RootState } from '../../../common/store';
import { useAppSelector } from '../../../hooks/app';
import { Strings } from '../../../resources/Strings';
import { CompareCardsStyles } from '../../../styles';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collaped.base;
const stringsRevision = Strings.components.searchDefault.base.collaped.revision;

interface CompareWithBaseProps {
  mode: 'light' | 'dark';
}

interface Expanded {
  expanded: boolean;
  class: string;
}

function CompareWithBase({ mode }: CompareWithBaseProps) {
  const styles = CompareCardsStyles(mode);
  const searchState = useAppSelector((state: RootState) => state.search);
  const {
    inputErrorBase,
    inputErrorNew,
    inputHelperText,
    baseRepository,
    newRepository,
    baseSearchResults,
    newSearchResults,
  } = searchState;

  const SearchPropsBase = {
    ...stringsBase,
    view: 'search' as 'search' | 'compare-results',
    mode,
    base: 'base' as 'new' | 'base',
    repository: baseRepository,
    inputError: inputErrorBase,
    inputHelperText: inputHelperText,
    searchResults: baseSearchResults,
  };

  const SearchPropsNew = {
    ...stringsRevision,
    view: 'search' as 'search' | 'compare-results',
    mode,
    base: 'new' as 'new' | 'base',
    repository: newRepository,
    inputError: inputErrorNew,
    inputHelperText: inputHelperText,
    searchResults: newSearchResults,
  };

  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const toggleIsExpanded = () => {
    setExpanded({
      expanded: !base.expanded,
      class: base.expanded ? 'default' : 'expanded',
    });
  };

  return (
    <div className='wrapper'>
      <div
        className={`compare-card-container compare-card-container--${base.class} ${styles.container}`}
        onClick={toggleIsExpanded}
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
        className={`compare-card-container content-base content-base--${base.class} ${styles.container} `}
      >
        <Divider className='divider' />
        <div className='form-wrapper'>
          <SearchComponent {...SearchPropsBase} />
          <SearchComponent {...SearchPropsNew} />
          <div className='framework'></div>
        </div>
      </div>
    </div>
  );
}

export default CompareWithBase;
