import { useState, Suspense } from 'react';

import { Grid, Skeleton, Stack } from '@mui/material';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { Container } from '@mui/system';
import { useLoaderData, Await } from 'react-router';
import { style } from 'typestyle';

import SubtestsCrossPlatformHeader, {
  type CrossPlatformHeaderProperties,
} from './SubtestsCrossPlatformHeader';
import SubtestsCrossPlatformTable from './SubtestsCrossPlatformTable';
import {
  subtestsCrossPlatformView,
  MANN_WHITNEY_U,
  STUDENT_T,
  RESULTS_TABLE_MAX_WIDTH,
} from '../../../../common/constants';
import { useAppSelector, useAppDispatch } from '../../../../hooks/app';
import useRawSearchParams from '../../../../hooks/useRawSearchParams';
import { updateShowMannWhitneyWarning } from '../../../../reducers/ColumnPrefsSlice';
import { Strings } from '../../../../resources/Strings';
import { Colors, Spacing } from '../../../../styles';
import type { PlatformSubtestResults } from '../../../../utils/subtestMatrix';
import { currentUrlParams } from '../../../../utils/tableStatePersistence';
import ToggleReplicatesButton from '../../../Shared/ToggleReplicatesButton';
import { DownloadButton, DisabledDownloadButton } from '../../DownloadButton';
import SearchInput from '../../SearchInput';
import { LoaderReturnValue } from '../../subtestsCrossPlatformLoader';
import SubtestsBreadcrumbs from '../SubtestsBreadcrumbs';

type CrossPlatformResultsHeaderProps = {
  platformResults: PlatformSubtestResults[];
  initialSearchTerm: string;
  onSearchTermChange: (term: string) => void;
};

function CrossPlatformResultsHeader({
  platformResults,
  initialSearchTerm,
  onSearchTermChange,
}: CrossPlatformResultsHeaderProps) {
  // Any platform's first row describes the test group; take the first one that
  // actually loaded.
  const representativeResult = platformResults
    .flatMap((platformResult) => platformResult.results)
    .at(0);
  if (!representativeResult) return null;

  const header: CrossPlatformHeaderProperties = {
    suite: representativeResult.suite,
    framework_id: representativeResult.framework_id,
    option_name: representativeResult.option_name,
    extra_options: representativeResult.extra_options,
    new_rev: representativeResult.new_rev,
    new_repo: representativeResult.new_repository_name,
    base_rev: representativeResult.base_rev,
    base_repo: representativeResult.base_repository_name,
    lower_is_better: representativeResult.lower_is_better,
  };

  return (
    <>
      <SubtestsCrossPlatformHeader
        header={header}
        platforms={platformResults.map(
          (platformResult) => platformResult.platform,
        )}
      />
      <Grid container spacing={1}>
        <Grid
          sx={{ marginInlineEnd: 'auto' }}
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <SearchInput
            defaultValue={initialSearchTerm}
            onChange={onSearchTermChange}
            strings={Strings.components.subtestsSearchResultsInput}
          />
        </Grid>
        <Grid size='auto'>
          <DownloadButton
            resultsPromise={platformResults.map(
              (platformResult) => platformResult.results,
            )}
          />
        </Grid>
      </Grid>
    </>
  );
}

function SubtestsCrossPlatformMain() {
  const { results, testVersion } = useLoaderData<LoaderReturnValue>();
  const dispatch = useAppDispatch();
  const showMannWhitneyWarning = useAppSelector(
    (state) => state.columnPrefs.showMannWhitneyWarning,
  );
  const displayMannWhitneyUWarning =
    testVersion === MANN_WHITNEY_U && showMannWhitneyWarning;

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
      maxWidth: RESULTS_TABLE_MAX_WIDTH,
    }),
    title: style({
      margin: 0,
      marginBottom: Spacing.Medium,
      fontSize: '16px',
    }),
  };

  const onSearchTermChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Build from the live URL (not the memoized rawSearchParams snapshot) so we
    // don't clobber params written out-of-band after mount — see
    // SubtestsResultsMain for the full rationale.
    const params = currentUrlParams();
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    updateRawSearchParams(params);
  };

  return (
    <Container
      className={styles.container}
      data-testid='subtests-cross-platform-main'
    >
      <header>
        <Grid container spacing={1}>
          <SubtestsBreadcrumbs view={subtestsCrossPlatformView} />
        </Grid>
        {testVersion === STUDENT_T && (
          <Grid sx={{ marginRight: '10px' }}>
            <ToggleReplicatesButton />
          </Grid>
        )}
        {displayMannWhitneyUWarning && (
          <Alert
            severity='warning'
            className={styles.title}
            onClose={() => dispatch(updateShowMannWhitneyWarning(false))}
          >
            {Strings.components.mannWhitneyUWarning.text}{' '}
            <Link
              href={Strings.components.mannWhitneyUWarning.href}
              target='_blank'
            >
              {Strings.components.mannWhitneyUWarning.linkText}
            </Link>
            {'. '} {Strings.components.mannWhitneyUWarning.text2}{' '}
          </Alert>
        )}
        <Suspense
          fallback={
            <>
              <Stack spacing={1} sx={{ marginBottom: '12px' }}>
                <Skeleton
                  variant='rounded'
                  sx={{
                    // This fontSize value makes the skeleton match the height of the replaced element.
                    fontSize: '2.18em',
                    backgroundColor: 'secondary.main',
                  }}
                />
              </Stack>
              <Grid container spacing={1}>
                <Grid
                  sx={{ marginInlineEnd: 'auto' }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <SearchInput
                    defaultValue={initialSearchTerm}
                    onChange={onSearchTermChange}
                    strings={Strings.components.subtestsSearchResultsInput}
                  />
                </Grid>
                <Grid size='auto'>
                  <DisabledDownloadButton />
                </Grid>
              </Grid>
            </>
          }
        >
          <Await resolve={results}>
            {(platformResults: PlatformSubtestResults[]) => (
              <CrossPlatformResultsHeader
                platformResults={platformResults}
                initialSearchTerm={initialSearchTerm}
                onSearchTermChange={onSearchTermChange}
              />
            )}
          </Await>
        </Suspense>
      </header>
      <SubtestsCrossPlatformTable
        filteringSearchTerm={searchTerm}
        resultsPromise={results}
        testVersion={testVersion}
      />
    </Container>
  );
}

export default SubtestsCrossPlatformMain;
