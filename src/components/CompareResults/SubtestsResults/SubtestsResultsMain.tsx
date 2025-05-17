import { useState, Suspense } from 'react';

import { Grid, Skeleton, Stack, Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData, Await } from 'react-router-dom';
import { style } from 'typestyle';

import SubtestsBreadcrumbs from './SubtestsBreadcrumbs';
import SubtestsResultsTable from './SubtestsResultsTable';
import SubtestsRevisionHeader from './SubtestsRevisionHeader';
import DownloadButton from '.././DownloadButton';
import SearchInput from '.././SearchInput';
import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import useRawSearchParams from '../../../hooks/useRawSearchParams';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import { getSubtestsHeaderAndPerfherderURL } from '../../../utils/subtestsUtils';
import RetriggerButton from '../Retrigger/RetriggerButton';
import { LoaderReturnValue } from '../subtestsLoader';
import { LoaderReturnValue as OvertimeLoaderReturnValue } from '../subtestsOverTimeLoader';

type SubtestsResultsMainProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

function SubtestsResultsMain({ view }: SubtestsResultsMainProps) {
  const { results } = useLoaderData() as
    | LoaderReturnValue
    | OvertimeLoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const styles = {
    container: style({
      backgroundColor: themeColor100,
      margin: '0 auto',
      marginBottom: '80px',
      maxWidth: 'xl',
    }),
    title: style({
      margin: 0,
      marginBottom: Spacing.Medium,
      fontSize: '16px',
    }),
  };

  const onSearchTermChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if (newSearchTerm) {
      rawSearchParams.set('search', newSearchTerm);
    } else {
      rawSearchParams.delete('search');
    }
    updateRawSearchParams(rawSearchParams);
  };

  return (
    <Container className={styles.container} data-testid='subtests-main'>
      <header>
        <SubtestsBreadcrumbs view={view} />

        <Suspense
          fallback={
            <div>
              <Stack spacing={1} sx={{ marginBottom: '12px' }}>
                <Alert severity='info' className={styles.title}>
                  A Perfherder link is available for{' '}
                  <Link href='' target='_blank'>
                    the same results
                  </Link>
                  {'.'}
                </Alert>
                <Skeleton
                  variant='rounded'
                  sx={{
                    fontSize: '1.784rem',
                    backgroundColor:
                      themeMode === 'light'
                        ? Colors.SecondaryDefault
                        : Colors.Background300Dark,
                  }}
                  animation='pulse'
                />
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6} sx={{ marginInlineEnd: 'auto' }}>
                  <SearchInput
                    defaultValue={initialSearchTerm}
                    onChange={onSearchTermChange}
                  />
                </Grid>
                <Grid item xs='auto'>
                  <DownloadButton resultsPromise={[]} />
                </Grid>
                <Grid item xs='auto'>
                  <RetriggerButton variant='text' />
                </Grid>
              </Grid>
            </div>
          }
        >
          <Await resolve={results}>
            {(loadedResults: CompareResultsItem[]) => {
              {
                if (!loadedResults.length) {
                  return <></>;
                }
              }
              const { intervalValue } =
                view === subtestsOverTimeView
                  ? (useLoaderData() as OvertimeLoaderReturnValue)
                  : { intervalValue: undefined };

              const { subtestsHeader, subtestsViewPerfherderURL } =
                getSubtestsHeaderAndPerfherderURL(
                  loadedResults,
                  view,
                  intervalValue,
                );

              return (
                <>
                  <Alert severity='info' className={styles.title}>
                    A Perfherder link is available for{' '}
                    <Link href={subtestsViewPerfherderURL} target='_blank'>
                      the same results
                    </Link>
                    {'.'}
                  </Alert>
                  <SubtestsRevisionHeader header={subtestsHeader} view={view} />
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6} sx={{ marginInlineEnd: 'auto' }}>
                      <SearchInput
                        defaultValue={initialSearchTerm}
                        onChange={onSearchTermChange}
                      />
                    </Grid>
                    <Grid item xs='auto'>
                      <DownloadButton resultsPromise={[loadedResults]} />
                    </Grid>
                    <Grid item xs='auto'>
                      <RetriggerButton
                        result={loadedResults[0]}
                        variant='text'
                      />
                    </Grid>
                  </Grid>
                </>
              );
            }}
          </Await>
        </Suspense>
      </header>

      <SubtestsResultsTable
        filteringSearchTerm={searchTerm}
        resultsPromise={results}
      />
    </Container>
  );
}

export default SubtestsResultsMain;
