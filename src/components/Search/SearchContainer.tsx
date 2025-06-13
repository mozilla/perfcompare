import React, { useState } from 'react';

import Typography from '@mui/material/Typography';
import { useLoaderData } from 'react-router';

import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';
import type { LoaderReturnValue } from './loader';
import SearchFormHeader from './SearchFormHeader';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import type { TimeRange } from '../../types/types';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = SearchContainerStyles(themeMode, /* isHome */ true);
  const [isBaseSearchExpanded, setIsBaseSearchExpanded] = useState(true);
  const { newRevInfo, newRepo, frameworkId } =
    useLoaderData<LoaderReturnValue>();

  return (
    <section
      data-testid='search-section'
      ref={props.containerRef}
      className={styles.container}
    >
      <Typography className='search-default-title'>{strings.title}</Typography>

      <div>
        <SearchFormHeader
          compareType={'base'}
          isExpanded={isBaseSearchExpanded}
          title={strings.base.title}
          subtitle={strings.base.tagline}
          onClick={() => setIsBaseSearchExpanded(true)}
        />
        {/* hard code the frameworkIdVal  because talos is the
       default framework; refer to frameworkMap in constants.ts */}
        <CompareWithBase
          frameworkIdVal={frameworkId}
          hasEditButton={false}
          baseRev={null}
          newRevs={newRevInfo ? [newRevInfo] : []}
          isExpanded={isBaseSearchExpanded}
          setIsExpanded={() => setIsBaseSearchExpanded(true)}
          baseRepo={newRepo}
          newRepo={newRepo}
        />
      </div>
      <div>
        <SearchFormHeader
          compareType={'time'}
          isExpanded={!isBaseSearchExpanded}
          title={strings.overTime.title}
          subtitle={strings.overTime.tagline}
          onClick={() => setIsBaseSearchExpanded(false)}
        />

        <CompareOverTime
          hasEditButton={false}
          newRevs={newRevInfo ? [newRevInfo] : []}
          isExpanded={!isBaseSearchExpanded}
          setIsExpanded={() => setIsBaseSearchExpanded(false)}
          frameworkIdVal={frameworkId}
          intervalValue={86400 as TimeRange['value']}
          baseRepo={newRepo}
          newRepo={newRepo}
        />
      </div>
    </section>
  );
}

interface SearchViewProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export default SearchContainer;
