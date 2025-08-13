import { useState, Suspense } from 'react';

import { Grid, Skeleton, Stack, Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData, Await } from 'react-router';
import { style } from 'typestyle';

import SubtestsBreadcrumbs from './SubtestsBreadcrumbs';
import SubtestsResultsTable from './SubtestsResultsTable';
import SubtestsRevisionHeader from './SubtestsRevisionHeader';
import { DownloadButton, DisabledDownloadButton } from '.././DownloadButton';
import SearchInput from '.././SearchInput';
import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import useRawSearchParams from '../../../hooks/useRawSearchParams';
import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type {
  CompareResultsItem,
  SubtestsRevisionsHeader,
} from '../../../types/state';
import ToggleReplicatesButton from '../../Shared/ToggleReplicatesButton';
import {
  RetriggerButton,
  DisabledRetriggerButton,
} from '../Retrigger/RetriggerButton';
import { LoaderReturnValue } from '../subtestsLoader';
import { LoaderReturnValue as OvertimeLoaderReturnValue } from '../subtestsOverTimeLoader';

type SubtestsResultsHeaderProps = {
  loadedResults: CompareResultsItem[];
  view: typeof subtestsView | typeof subtestsOverTimeView;
  initialSearchTerm: string;
  onSearchTermChange: (term: string) => void;
};

function SubtestsResultsHeader({
  loadedResults,
  view,
  initialSearchTerm,
  onSearchTermChange,
}: SubtestsResultsHeaderProps) {
  if (!loadedResults.length) return null;

  const subtestsHeader: SubtestsRevisionsHeader = {
    suite: loadedResults[0].suite,
    framework_id: loadedResults[0].framework_id,
    test: loadedResults[0].test,
    option_name: loadedResults[0].option_name,
    extra_options: loadedResults[0].extra_options,
    new_rev: loadedResults[0].new_rev,
    new_repo: loadedResults[0].new_repository_name,
    base_rev: loadedResults[0].base_rev,
    base_repo: loadedResults[0].base_repository_name,
    base_parent_signature: loadedResults[0].base_parent_signature,
    new_parent_signature: loadedResults[0].base_parent_signature,
    platform: loadedResults[0].platform,
  };

  return (
    <>
      <SubtestsRevisionHeader header={subtestsHeader} view={view} />
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
          <DownloadButton resultsPromise={[loadedResults]} />
        </Grid>
        <Grid size='auto'>
          <RetriggerButton result={loadedResults[0]} variant='text' />
        </Grid>
      </Grid>
    </>
  );
}

type SubtestsResultsMainProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

type CombinedLoaderReturnValue = LoaderReturnValue | OvertimeLoaderReturnValue;

function SubtestsResultsMain({ view }: SubtestsResultsMainProps) {
  const { results, subtestsViewPerfherderURL, replicates } =
    useLoaderData<CombinedLoaderReturnValue>();

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
      maxWidth: '1300px',
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
        <Grid container spacing={1}>
          <SubtestsBreadcrumbs view={view} />
        </Grid>
        <Grid sx={{ marginRight: '10px' }}>
          <ToggleReplicatesButton />
        </Grid>
        <Alert severity='info' className={styles.title}>
          A Perfherder link is available for{' '}
          <Link href={subtestsViewPerfherderURL} target='_blank'>
            the same results
          </Link>
          {'.'}
        </Alert>

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
                <Grid size='auto'>
                  <DisabledRetriggerButton />
                </Grid>
              </Grid>
            </>
          }
        >
          <Await resolve={results}>
            {(loadedResults: CompareResultsItem[]) => (
              <SubtestsResultsHeader
                loadedResults={loadedResults}
                view={view}
                initialSearchTerm={initialSearchTerm}
                onSearchTermChange={onSearchTermChange}
              />
            )}
          </Await>
        </Suspense>
      </header>
      <SubtestsResultsTable
        filteringSearchTerm={searchTerm}
        resultsPromise={results}
        replicates={replicates}
      />
    </Container>
  );
}

export default SubtestsResultsMain;
