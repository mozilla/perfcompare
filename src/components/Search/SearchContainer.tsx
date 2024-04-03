import React from 'react';

import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = SearchContainerStyles(themeMode, /* isHome */ true);
  const checkedChangesetsNew = useAppSelector(
    (state) => state.search.new.checkedRevisions,
  );
  const checkedChangesetsBase = useAppSelector(
    (state) => state.search.base.checkedRevisions,
  );

  return (
    <section
      data-testid='search-section'
      ref={props.containerRef}
      className={styles.container}
    >
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase
        hasNonEditableState={false}
        baseRevs={checkedChangesetsBase}
        newRevs={checkedChangesetsNew}
      />

      <CompareOverTime
        isEditable={false}
        baseRevs={checkedChangesetsBase}
        newRevs={checkedChangesetsNew}
      />
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
