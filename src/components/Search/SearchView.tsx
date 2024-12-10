import { useRef, useEffect } from 'react';

import { style } from 'typestyle';

import SearchContainer from './SearchContainer';
import { useAppSelector } from '../../hooks/app';
import { background } from '../../styles';
import { skipLink } from '../../styles';
import SkipLink from '../Accessibility/SkipLink';
import PerfCompareHeader from '../Shared/PerfCompareHeader';

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
      <PerfCompareHeader isHome />
      <SearchContainer containerRef={containerRef} />
    </div>
  );
}

interface SearchViewProps {
  title: string;
}

export default SearchView;
