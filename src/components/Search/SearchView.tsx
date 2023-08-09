import { useRef, useEffect } from 'react';

import type { Theme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { style } from 'typestyle';

import { repoMap } from '../../common/constants';
import { searchView } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { background } from '../../styles';
import { skipLink } from '../../styles';
import { RevisionsList, View } from '../../types/state';
import SkipLink from '../Accessibility/SkipLink';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SearchContainer from './SearchContainer';
import SearchViewInit from './SearchViewInit';

function SearchView(props: SearchViewProps) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { toggleColorMode, protocolTheme, title } = props;
  const themeMode = protocolTheme.palette.mode;
  const selectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions.revisions,
  );

  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };
  const goToCompareResultsPage = (selectedRevs: RevisionsList[]) => {
    const revs = selectedRevs.map((rev) => rev.revision);
    const repos = selectedRevs.map((rev) => repoMap[rev.repository_id]);
    navigate({
      pathname: '/compare-results',
      search: `?revs=${revs.join(',')}&repos=${repos.join(',')}`,
    });
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (selectedRevisions.length > 0) {
      goToCompareResultsPage(selectedRevisions);
    }
  }, [selectedRevisions]);

  return (
    <div className={styles.container}>
      <SkipLink containerRef={containerRef}>
        <button className={skipLink} role='link' tabIndex={1}>
          Skip to search
        </button>
      </SkipLink>
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
        view={searchView as View}
      />
      <SearchViewInit />
      <SearchContainer containerRef={containerRef} themeMode={themeMode} />
    </div>
  );
}

interface SearchViewProps {
  toggleColorMode: () => void;
  protocolTheme: Theme;
  title: string;
}

export default SearchView;
