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
  return (
    <section
      data-testid='search-section'
      ref={props.containerRef}
      className={styles.container}
    >
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase hasNonEditableState={false} baseRevs={[]} newRevs={[]} />
      {/* hidden until post-mvp release */}
      <CompareOverTime isEditable={false} baseRevs={[]} newRevs={[]} />
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
