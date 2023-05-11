import { useState } from 'react';

import Divider from '@mui/material/Divider';

import { Strings } from '../../../resources/Strings';
import { CompareCardsStyles } from '../../../styles';
import BaseSearch from './BaseSearch';
const strings = Strings.components.searchDefault;

interface Expanded {
  expanded: boolean;
  class: string;
}

function CompareWithBase(props: CompareWithBaseProps) {
  const { mode } = props;
  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const styles = CompareCardsStyles(mode);

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
          <BaseSearch view='search' mode={mode} />
          <div className='revision-search'></div>
          <div className='framework'></div>
        </div>
      </div>
    </div>
  );
}

interface CompareWithBaseProps {
  mode: 'light' | 'dark';
}

export default CompareWithBase;
