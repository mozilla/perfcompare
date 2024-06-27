import { useEffect } from 'react';
import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useLoaderData, Await } from 'react-router-dom';
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
  const { baseRevInfo, newRevsInfo, frameworkId, results, baseRepo, newRepos } =
    useLoaderData() as LoaderReturnValue;
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
          <React.Suspense
            fallback={
              <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                mb={5}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Await resolve={results}>
              <ResultsMain />
            </Await>
          </React.Suspense>
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
