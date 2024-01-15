import { useRef, useEffect } from 'react';

import { style } from 'typestyle';

import { searchView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { background } from '../../styles';
import { skipLink } from '../../styles';
import { View } from '../../types/state';
import SkipLink from '../Accessibility/SkipLink';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import SearchContainer from './SearchContainer';
import SearchViewInit from './SearchViewInit';

function SearchView(props: SearchViewProps) {
  const containerRef = useRef(null);
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);

  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={styles.container}>
      <SkipLink containerRef={containerRef}>
        <button className={skipLink} role='link' tabIndex={1}>
          Skip to search
        </button>
      </SkipLink>
      <PerfCompareHeader view={searchView as View} />
      <SearchViewInit />
      <SearchContainer containerRef={containerRef} />
    </div>
  );
}

interface SearchViewProps {
  title: string;
}

export default SearchView;
