import type { Theme } from '@mui/material';
import { connect } from 'react-redux';
import { style } from 'typestyle';

import type { RootState } from '../../../common/store';
import { background } from '../../../styles';
import { Revision } from '../../../types/state';
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
  searchResults: Revision[];
}

function mapStateToProps(state: RootState) {
  return {
    searchResults: state.search.searchResults,
    selectedRevisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(SearchViewBeta);
