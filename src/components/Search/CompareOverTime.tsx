import { useState, createRef } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { SearchStyles } from '../../styles';
import type { ThemeMode, View } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponentCompareOverTime from './SearchComponentCompareOverTime';

const strings = Strings.components.searchDefault;
const stringsRevision =
  Strings.components.searchDefault.base.collapsed.revision;

interface CompareOverTimeProps {
  mode: ThemeMode;
  view: View;
}

interface Expanded {
  expanded: boolean;
  class: string;
}

function CompareOverTime({ mode, view }: CompareOverTimeProps) {
  const formWrapperRef = createRef<HTMLDivElement>();
  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const isWarning = false;
  const searchCompCommonProps = {
    mode,
    view,
    isWarning,
  };

  const toggleIsExpanded = () => {
    setExpanded({
      expanded: !base.expanded,
      class: base.expanded ? 'hidden' : 'expanded',
    });
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
        className={`compare-card-container compare-card-container--${base.class} ${styles.container}`}
        onClick={toggleIsExpanded}
        data-testid='base-state'
      >
        <div className={`compare-card-text ${styles.cardText}`}>
          <div className='compare-card-title'>{strings.overTime.title}</div>
          <div className='compare-card-tagline'>{strings.overTime.tagline}</div>
        </div>
        <div
          className='compare-card-img compare-card-img--time'
          aria-label='compare over time clock'
        />
      </div>

      <div
        className={`compare-card-container content-base content-base--${base.class} ${styles.container} `}
      >
        <Divider className='divider' />
        <div ref={formWrapperRef} className='form-wrapper'>
          <SearchComponentCompareOverTime
            searchType='new'
            comparisonType='searchCompareOverTime'
            {...stringsRevision}
            {...searchCompCommonProps}
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown
              mode={mode}
              view={view}
              comparisonType='searchCompareOverTime'
            />
            <CompareButton mode={mode} view={view} />
          </Grid>
        </div>
      </div>
    </Grid>
  );
}

export default CompareOverTime;
