import { useState } from 'react';

import { Grid, Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import SubtestsBreadcrumbs from './SubtestsBreadcrumbs';
import SubtestsResultsTable from './SubtestsResultsTable';
import SubtestsRevisionHeader from './SubtestsRevisionHeader';
import DownloadButton from '.././DownloadButton';
import NoResultsFound from '.././NoResultsFound';
import SearchInput from '.././SearchInput';
import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import useRawSearchParams from '../../../hooks/useRawSearchParams';
import {
  getPerfherderSubtestsCompareWithBaseViewURL,
  getPerfherderSubtestsCompareOverTimeViewURL,
} from '../../../logic/treeherder';
import { Colors, Spacing } from '../../../styles';
import type { SubtestsRevisionsHeader } from '../../../types/state';
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

  if (!results.length) {
    return (
      <>
        <Container
          maxWidth={false}
          sx={{ maxWidth: '1300px' }}
          className={styles.container}
          data-testid='subtests-main'
        >
          <header>
            <SubtestsBreadcrumbs view={view} />
            <NoResultsFound />
          </header>
        </Container>
      </>
    );
  }

  const subtestsHeader: SubtestsRevisionsHeader = {
    suite: results[0].suite,
    framework_id: results[0].framework_id,
    test: results[0].test,
    option_name: results[0].option_name,
    extra_options: results[0].extra_options,
    new_rev: results[0].new_rev,
    new_repo: results[0].new_repository_name,
    base_rev: results[0].base_rev,
    base_repo: results[0].base_repository_name,
    base_parent_signature: results[0].base_parent_signature,
    new_parent_signature: results[0].base_parent_signature,
    platform: results[0].platform,
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
    <Container
      maxWidth={false}
      sx={{ maxWidth: '1300px' }}
      className={styles.container}
      data-testid='subtests-main'
    >
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
            <DownloadButton resultsPromise={[results]} />
          </Grid>
          <Grid item xs='auto'>
            <RetriggerButton result={results[0]} variant='text' />
          </Grid>
        </Grid>
      </header>
      <SubtestsResultsTable
        filteringSearchTerm={searchTerm}
        results={results}
      />
    </Container>
  );
}

export default SubtestsResultsMain;
