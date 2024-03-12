import React from 'react';

import Typography from '@mui/material/Typography';

import { repoMap } from '../../common/constants';
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

  // The "??" operations below are so that Typescript doesn't wonder about the
  // undefined value later.
  const checkedNewRepos = checkedChangesetsNew.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );
  const checkedBaseRepos = checkedChangesetsBase.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );

  return (
    <section
      data-testid='search-section'
      ref={props.containerRef}
      className={styles.container}
    >
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase
        isEditable={false}
        baseRevs={checkedChangesetsBase}
        newRevs={checkedChangesetsNew}
        baseRepos={checkedBaseRepos}
        newRepos={checkedNewRepos}
      />
      {/* hidden until post-mvp release */}
      <CompareOverTime />
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
