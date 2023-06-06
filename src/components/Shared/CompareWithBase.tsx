import { useState } from 'react';

import Divider from '@mui/material/Divider';

import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { InputType } from '../../types/state';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsRevision =
  Strings.components.searchDefault.base.collapsed.revision;

interface CompareWithBaseProps {
  mode: 'light' | 'dark';
}

interface Expanded {
  expanded: boolean;
  class: string;
}

function CompareWithBase({ mode }: CompareWithBaseProps) {
  const styles = CompareCardsStyles(mode);

  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const toggleIsExpanded = () => {
    setExpanded({
      expanded: !base.expanded,
      class: base.expanded ? 'hidden' : 'expanded',
    });
  };

  return (
    <div className='wrapper'>
      <div
        className={`compare-card-container compare-card-container--${base.class} ${styles.container}`}
        onClick={toggleIsExpanded}
      >
        <div
          data-testid={`base-${base.class}`}
          className={`compare-card-text ${styles.cardText}`}
        >
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
          <SearchComponent
            searchType={'base' as InputType}
            mode={mode}
            view='search'
            {...stringsBase}
          />
          <SearchComponent
            searchType={'new' as InputType}
            mode={mode}
            view='search'
            {...stringsRevision}
          />
          <div className='framework'></div>
        </div>
      </div>
    </div>
  );
}

export default CompareWithBase;
