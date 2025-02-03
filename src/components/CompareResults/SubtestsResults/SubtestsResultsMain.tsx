import { useState, useEffect } from 'react';

import { Grid, Skeleton, Stack } from '@mui/material';
import { Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import SubtestsBreadcrumbs from './SubtestsBreadcrumbs';
import SubtestsResultsTable from './SubtestsResultsTable';
import SubtestsRevisionHeader from './SubtestsRevisionHeader';
import DownloadButton from '.././DownloadButton';
import SearchInput from '.././SearchInput';
import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import useRawSearchParams from '../../../hooks/useRawSearchParams';
import {
  getPerfherderSubtestsCompareWithBaseViewURL,
  getPerfherderSubtestsCompareOverTimeViewURL,
} from '../../../logic/treeherder';
import { Colors, Spacing } from '../../../styles';
import type {
  SubtestsRevisionsHeader,
  CompareResultsItem,
} from '../../../types/state';
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
  const [resolvedResults, setResolvedResults] = useState<CompareResultsItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;

    results
      .then((data) => {
        if (isMounted) {
          setResolvedResults(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as string);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    throw new Error(error);
  }

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const styles = {
    container: style({
      backgroundColor: themeColor100,
      margin: '0 auto',
      marginBottom: '80px',
    }),
    title: style({
      margin: 0,
      marginBottom: Spacing.Medium,
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

  if (!resolvedResults.length) {
    return (
      <>
        <Container className={styles.container} data-testid='subtests-main'>
          {isLoading ? (
            <>
              <header>
                <SubtestsBreadcrumbs view={view} />

                <Alert severity='info' className={styles.title}>
                  A Perfherder link is available for the same results
                  {'.'}
                </Alert>
                <Stack spacing={1} sx={{ marginBottom: '12px' }}>
                  <Skeleton
                    variant='rounded'
                    sx={{ fontSize: '2.11rem' }}
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
                    <DownloadButton resultsPromise={[resolvedResults]} />
                  </Grid>
                  <Grid item xs='auto'>
                    <RetriggerButton variant='text' />
                  </Grid>
                </Grid>
              </header>
              <SubtestsResultsTable
                filteringSearchTerm={searchTerm}
                isLoading={isLoading}
              />
            </>
          ) : (
            <SubtestsResultsTable
              filteringSearchTerm={searchTerm}
              isLoading={isLoading}
            />
          )}
        </Container>
      </>
    );
  }

  const subtestsHeader: SubtestsRevisionsHeader = {
    suite: resolvedResults[0].suite,
    framework_id: resolvedResults[0].framework_id,
    test: resolvedResults[0].test,
    option_name: resolvedResults[0].option_name,
    extra_options: resolvedResults[0].extra_options,
    new_rev: resolvedResults[0].new_rev,
    new_repo: resolvedResults[0].new_repository_name,
    base_rev: resolvedResults[0].base_rev,
    base_repo: resolvedResults[0].base_repository_name,
    base_parent_signature: resolvedResults[0].base_parent_signature,
    new_parent_signature: resolvedResults[0].base_parent_signature,
    platform: resolvedResults[0].platform,
  };

  let subtestsViewPerfherderURL;
  if (
    subtestsHeader.base_parent_signature !== null &&
    subtestsHeader.new_parent_signature !== null
  ) {
    if (view === subtestsOverTimeView) {
      const { intervalValue } = useLoaderData() as OvertimeLoaderReturnValue;
      subtestsViewPerfherderURL = getPerfherderSubtestsCompareOverTimeViewURL(
        subtestsHeader.base_repo,
        subtestsHeader.new_repo,
        subtestsHeader.new_rev,
        subtestsHeader.framework_id,
        intervalValue,
        subtestsHeader.base_parent_signature,
        subtestsHeader.new_parent_signature,
      );
    } else
      subtestsViewPerfherderURL = getPerfherderSubtestsCompareWithBaseViewURL(
        subtestsHeader.base_repo,
        subtestsHeader.base_rev,
        subtestsHeader.base_repo,
        subtestsHeader.new_rev,
        subtestsHeader.framework_id,
        subtestsHeader.base_parent_signature,
        subtestsHeader.new_parent_signature,
      );
  }

  return (
    <Container className={styles.container} data-testid='subtests-main'>
      <header>
        <SubtestsBreadcrumbs view={view} />
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
            <DownloadButton resultsPromise={[resolvedResults]} />
          </Grid>
          <Grid item xs='auto'>
            <RetriggerButton result={resolvedResults[0]} variant='text' />
          </Grid>
        </Grid>
      </header>
      <SubtestsResultsTable
        filteringSearchTerm={searchTerm}
        results={resolvedResults}
      />
    </Container>
  );
}

export default SubtestsResultsMain;
