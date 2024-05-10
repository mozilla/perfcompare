import React, { useState } from 'react';

import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import type { Framework } from '../../types/types';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = SearchContainerStyles(themeMode, /* isHome */ true);
  const [isBaseSearch, expandBaseComponent] = useState(null as null | boolean);

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
        hasNonEditableState={false}
        baseRev={null}
        newRevs={[]}
        isBaseSearch={isBaseSearch}
        expandBaseComponent={expandBaseComponent}
      />
      <CompareOverTime
        hasNonEditableState={false}
        newRevs={[]}
        isBaseSearch={isBaseSearch}
        expandBaseComponent={expandBaseComponent}
        frameworkIdVal={1 as Framework['id']}
      />
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
