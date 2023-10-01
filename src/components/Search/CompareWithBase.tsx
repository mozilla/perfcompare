import { useState, createRef, useEffect } from 'react';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { useSnackbar, VariantType } from 'notistack';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';
import { SearchStyles } from '../../styles';
import type { ThemeMode, View } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchComponent from './SearchComponent';

const strings = Strings.components.searchDefault;
const stringsBase = Strings.components.searchDefault.base.collapsed.base;
const stringsRevision =
  Strings.components.searchDefault.base.collapsed.revision;
const warning = strings.base.collapsed.warnings.comparison;

interface CompareWithBaseProps {
  mode: ThemeMode;
  view: View;
}

interface Expanded {
  expanded: boolean;
  class: string;
}

function CompareWithBase({ mode, view }: CompareWithBaseProps) {
  const formWrapperRef = createRef<HTMLDivElement>();
  const { enqueueSnackbar } = useSnackbar();
  const { search } = useAppSelector((state) => state);
  const [base, setExpanded] = useState<Expanded>({
    expanded: true,
    class: 'expanded',
  });

  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const baseRepository = search.base.repository;
  const newRepository = search.new.repository;
  const variant: VariantType = 'warning';
  const isWarning =
    (baseRepository === 'try' && newRepository !== 'try') ||
    (baseRepository !== 'try' && newRepository === 'try');
  const searchCompCommonProps = {
    mode,
    view,
    isWarning,
  };

  useEffect(() => {
    //show warning if try is being compared to a non-try repo or vice versa
    if (isWarning) {
      enqueueSnackbar(warning, { variant });
    }
  }, [isWarning]);

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
          <div className='compare-card-title'>{strings.base.title}</div>
          <div className='compare-card-tagline'>{strings.base.tagline}</div>
        </div>
        <div
          role='img'
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
            searchType='base'
            {...stringsBase}
            {...searchCompCommonProps}
          />
          <SearchComponent
            searchType='new'
            {...stringsRevision}
            {...searchCompCommonProps}
          />
          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <FrameworkDropdown mode={mode} view={view} />
            <CompareButton mode={mode} view={view} />
          </Grid>
        </div>
      </div>
    </Grid>
  );
}

export default CompareWithBase;
