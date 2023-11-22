import React from 'react';

import Typography from '@mui/material/Typography';

import { repoMap, searchView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import type { ThemeMode } from '../../types/state';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const { themeMode } = props;
  const styles = SearchContainerStyles(themeMode, searchView);
  const checkedRevisionsListNew = useAppSelector(
    (state) => state.search.new.checkedRevisions,
  );
  const checkedRevisionsListBase = useAppSelector(
    (state) => state.search.base.checkedRevisions,
  );

  // The "??" operations below are so that Typescript doesn't wonder about the
  // undefined value later.
  const checkedNewRepos = checkedRevisionsListNew.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );
  const checkedBaseRepos = checkedRevisionsListBase.map(
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
        mode={themeMode}
        isEditable={false}
        baseRevs={checkedRevisionsListBase}
        newRevs={checkedRevisionsListNew}
        baseRepos={checkedBaseRepos}
        newRepos={checkedNewRepos}
      />
      {/* hidden until post-mvp release */}
      <CompareOverTime mode={themeMode} />
    </section>
  );
}

interface SearchViewProps {
  themeMode: ThemeMode;
  containerRef: React.RefObject<HTMLElement>;
}

export default SearchContainer;
