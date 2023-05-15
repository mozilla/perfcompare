import type { Theme } from '@mui/material';
import { style } from 'typestyle';

import { background } from '../../../styles';
import PerfCompareHeader from '../../Shared/beta/PerfCompareHeader';
import SearchViewInit from '../SearchViewInit';
import SearchContainer from './SearchContainer';

function SearchViewBeta(props: SearchViewProps) {
  const { toggleColorMode, protocolTheme } = props;
  const themeMode = protocolTheme.palette.mode;

  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  return (
    <div className={styles.container}>
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
      />
      <SearchViewInit />
      <SearchContainer themeMode={themeMode} />
    </div>
  );
}

interface SearchViewProps {
  toggleColorMode: () => void;
  protocolTheme: Theme;
}

export default SearchViewBeta;
