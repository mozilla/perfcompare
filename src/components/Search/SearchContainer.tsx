import React, { useState } from 'react';

import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import type { Framework, TimeRange } from '../../types/types';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = SearchContainerStyles(themeMode, /* isHome */ true);
  const [isBaseSearchExpanded, setIsBaseSearchExpanded] = useState(true);

  return (
    <section
      data-testid='search-section'
      ref={props.containerRef}
      className={styles.container}
    >
      <Typography className='search-default-title'>{strings.title}</Typography>
      {/* hard code the frameworkIdVal  because talos is the
       default framework; refer to frameworkMap in constants.ts */}
      <CompareWithBase
        frameworkIdVal={1 as Framework['id']}
        hasEditButton={false}
        baseRev={null}
        newRevs={[]}
        isExpanded={isBaseSearchExpanded}
        setIsExpanded={() => setIsBaseSearchExpanded(true)}
        baseRepo='try'
        newRepo='try'
      />
      <CompareOverTime
        hasEditButton={false}
        newRevs={[]}
        isExpanded={!isBaseSearchExpanded}
        setIsExpanded={() => setIsBaseSearchExpanded(false)}
        frameworkIdVal={1 as Framework['id']}
        intervalValue={86400 as TimeRange['value']}
        baseRepo='try'
        newRepo='try'
      />
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
