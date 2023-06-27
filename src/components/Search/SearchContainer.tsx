import React from 'react';

import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { FontsRaw, Spacing } from '../../styles';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const { themeMode } = props;

  const styles = {
    container: style({
      maxWidth: '810px',
      marginTop: `${Spacing.layoutLarge + 20}px`,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      $nest: {
        '.search-default-title': {
          ...(themeMode === 'light'
            ? FontsRaw.HeadingXS
            : FontsRaw.HeadingXSDark),
          marginBottom: `${Spacing.xLarge + 10}px`,
          textAlign: 'center',
        },
      },
    }),
  };

  return (
    <section data-testid="search-section" ref={props.containerRef} className={styles.container}>
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase mode={themeMode} />
      {/* hidden until post-mvp release */}
      <CompareOverTime mode={themeMode} />
    </section>
  );
}

interface SearchViewProps {
  themeMode: 'light' | 'dark';
  containerRef: React.RefObject<HTMLElement>
}

export default SearchContainer;
