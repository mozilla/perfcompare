import { useEffect } from 'react';
import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { SearchContainerStyles, background } from '../../styles';
import CompareOverTime from '../Search/CompareOverTime';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import type { LoaderReturnValue } from './overTimeLoader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const {
    newRevsInfo,
    frameworkId,
    intervalValue,
    results,
    baseRepo,
    newRepos,
  } = useLoaderData() as LoaderReturnValue;
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
      data-testid='beta-version-compare-overtime-results'
    >
      <PerfCompareHeader />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareOverTime
          hasEditButton={true}
          newRevs={newRevsInfo ?? []}
          isBaseSearch={true}
          expandBaseComponent={() => null}
          frameworkIdVal={frameworkId}
          intervalValue={intervalValue}
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
