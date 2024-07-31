import { useEffect, useMemo } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { SearchContainerStyles, background } from '../../styles';
import CompareWithBase from '../Search/CompareWithBase';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import type { LoaderReturnValue } from './loader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const loaderData = useLoaderData() as LoaderReturnValue;

  // Memoize baseRevInfo, newRevsInfo, baseRepo
  const { baseRevInfo, newRevsInfo, baseRepo } = useMemo(
    () => ({
      baseRevInfo: loaderData.baseRevInfo,
      newRevsInfo: loaderData.newRevsInfo,
      baseRepo: loaderData.baseRepo,
    }),
    [loaderData.baseRevInfo, loaderData.newRevsInfo, loaderData.baseRepo],
  );

  const frameworkId = loaderData.frameworkId;
  const newRepos = loaderData.newRepos;
  const newRepo = newRepos[0];
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareWithBase
          hasEditButton={true}
          baseRev={baseRevInfo ?? null}
          newRevs={newRevsInfo ?? []}
          frameworkIdVal={frameworkId}
          isBaseSearch={null}
          expandBaseComponent={() => null}
          baseRepo={baseRepo}
          newRepo={newRepo}
        />
      </section>

      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
