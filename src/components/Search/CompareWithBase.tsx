import { useState, createRef, useEffect } from 'react';

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
  const formWrapperRef = createRef<HTMLDivElement>();
  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const [formHeight, setFormHeight] = useState<number>(400);
  const styles = CompareCardsStyles(mode, formHeight);

  useEffect(() => {
    setFormHeight(formWrapperRef.current?.clientHeight || formHeight);
  }, [formHeight]);

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
        className={`compare-card-container content-base content-base--${base.class} ${styles.container} `}
      >
        <Divider className='divider' />
        <div ref={formWrapperRef} className='form-wrapper'>
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
