import { useRef } from 'react';

import type { Theme } from '@mui/material';
import { style } from 'typestyle';

import { background } from '../../styles';
import { skipLink } from '../../styles';
import SkipLink from '../Accessibility/SkipLink';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SearchContainer from './SearchContainer';
import SearchViewInit from './SearchViewInit';

function SearchView(props: SearchViewProps) {
  const containerRef = useRef(null);
  const { toggleColorMode, protocolTheme } = props;
  const themeMode = protocolTheme.palette.mode;

  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  return (
    <div className={styles.container}>
      <SkipLink containerRef={containerRef}>
        <button className={skipLink} role="link" tabIndex={1}>Skip to search</button>
        </SkipLink>
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
      />
      <SearchViewInit />
      <SearchContainer containerRef={containerRef} themeMode={themeMode} />
    </div>
  );
}

interface SearchViewProps {
  toggleColorMode: () => void;
  protocolTheme: Theme;
}

export default SearchView;
