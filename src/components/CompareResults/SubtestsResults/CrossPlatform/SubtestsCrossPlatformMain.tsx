import { Suspense } from 'react';

import { Grid, Skeleton, Typography } from '@mui/material';
import { Container } from '@mui/system';
import { Await, useLoaderData } from 'react-router';
import { style } from 'typestyle';

import SubtestsCrossPlatformTable from './SubtestsCrossPlatformTable';
import {
  MANN_WHITNEY_U,
  RESULTS_TABLE_MAX_WIDTH,
  STUDENT_T,
  subtestsCrossPlatformView,
} from '../../../../common/constants';
import { useAppSelector } from '../../../../hooks/app';
import useSearchTermParam from '../../../../hooks/useSearchTermParam';
import { Strings } from '../../../../resources/Strings';
import { Colors, Spacing } from '../../../../styles';
import type { SubtestsRevisionsHeader } from '../../../../types/state';
import type { PlatformSubtestResults } from '../../../../utils/subtestMatrix';
import ToggleReplicatesButton from '../../../Shared/ToggleReplicatesButton';
import { DisabledDownloadButton, DownloadButton } from '../../DownloadButton';
import MannWhitneyUWarning from '../../MannWhitneyUWarning';
import SearchInput from '../../SearchInput';
import type { LoaderReturnValue } from '../../subtestsCrossPlatformLoader';
import SubtestsBreadcrumbs from '../SubtestsBreadcrumbs';
import SubtestsRevisionHeader from '../SubtestsRevisionHeader';

// Platforms are merged across test options, so the header only shows the
// options they all share; the column labels tell the others apart.
function getCrossPlatformHeader(
  platformResults: PlatformSubtestResults[],
): SubtestsRevisionsHeader | null {
  const firstResults = platformResults.flatMap(({ results }) =>
    results.slice(0, 1),
  );
  const [first] = firstResults;
  if (!first) return null;

  const extraOptions = firstResults.map(({ extra_options }) =>
    extra_options.split(' ').filter(Boolean),
  );
  const sharedExtraOptions = extraOptions[0].filter((option) =>
    extraOptions.every((options) => options.includes(option)),
  );
  const sharedOptionName = firstResults.every(
    ({ option_name }) => option_name === first.option_name,
  );

  return {
    suite: first.suite,
    framework_id: first.framework_id,
    test: first.test,
    option_name: sharedOptionName ? first.option_name : '',
    extra_options: sharedExtraOptions.join(' '),
    new_rev: first.new_rev,
    new_repo: first.new_repository_name,
    base_rev: first.base_rev,
    base_repo: first.base_repository_name,
    base_parent_signature: null,
    new_parent_signature: null,
    platform: first.platform,
    lower_is_better: first.lower_is_better,
  };
}

function CrossPlatformHeader({
  platformResults,
}: {
  platformResults: PlatformSubtestResults[];
}) {
  const header = getCrossPlatformHeader(platformResults);
  if (!header) return null;
  return (
    <SubtestsRevisionHeader
      header={header}
      view={subtestsCrossPlatformView}
      platforms={platformResults.map(({ platform }) => platform)}
    />
  );
}

function SubtestsCrossPlatformMain() {
  const { results, testVersion } = useLoaderData<LoaderReturnValue>();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { initialSearchTerm, searchTerm, onSearchTermChange } =
    useSearchTermParam();

  const styles = {
    container: style({
      backgroundColor:
        themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark,
      margin: '0 auto',
      marginBottom: '80px',
      maxWidth: RESULTS_TABLE_MAX_WIDTH,
    }),
    title: style({
      margin: 0,
      marginBottom: Spacing.Medium,
      fontSize: '16px',
    }),
    replicates: style({
      marginRight: '10px',
    }),
  };

  return (
    <Container
      className={styles.container}
      data-testid='subtests-cross-platform-main'
    >
      <header>
        <Grid
          container
          sx={{
            alignItems: 'center',
            gap: 1,
            margin: `0 0 ${Spacing.Medium}px 0`,
            justifyContent: 'space-between',
          }}
        >
          <SubtestsBreadcrumbs view={subtestsCrossPlatformView} />
          {testVersion === STUDENT_T && (
            <Grid className={styles.replicates}>
              <ToggleReplicatesButton />
            </Grid>
          )}
        </Grid>
        {testVersion === MANN_WHITNEY_U && (
          <MannWhitneyUWarning className={styles.title} />
        )}
        <Suspense
          fallback={
            <Skeleton
              variant='rounded'
              sx={{
                // Matches the height of the replaced header.
                fontSize: '2.18em',
                marginBottom: '12px',
                backgroundColor: 'secondary.main',
              }}
            />
          }
        >
          <Await resolve={results}>
            {(platformResults: PlatformSubtestResults[]) => (
              <CrossPlatformHeader platformResults={platformResults} />
            )}
          </Await>
        </Suspense>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ marginBottom: `${Spacing.Medium}px` }}
        >
          {Strings.components.crossPlatformSubtests.description}
        </Typography>
        <Grid container spacing={1}>
          <Grid sx={{ marginInlineEnd: 'auto' }} size={{ xs: 12, md: 6 }}>
            <SearchInput
              defaultValue={initialSearchTerm}
              onChange={onSearchTermChange}
              strings={Strings.components.subtestsSearchResultsInput}
            />
          </Grid>
          <Grid size='auto'>
            <Suspense fallback={<DisabledDownloadButton />}>
              <Await resolve={results}>
                {(platformResults: PlatformSubtestResults[]) => (
                  <DownloadButton
                    resultsPromise={platformResults.map(
                      (platformResult) => platformResult.results,
                    )}
                  />
                )}
              </Await>
            </Suspense>
          </Grid>
        </Grid>
      </header>
      <SubtestsCrossPlatformTable
        filteringSearchTerm={searchTerm}
        resultsPromise={results}
      />
    </Container>
  );
}

export default SubtestsCrossPlatformMain;
