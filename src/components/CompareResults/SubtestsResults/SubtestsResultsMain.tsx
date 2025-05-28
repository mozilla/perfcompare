import { useState, Suspense } from 'react';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Grid, Skeleton, Stack, Link, Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
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
import type {
  CompareResultsItem,
  SubtestsRevisionsHeader,
} from '../../../types/state';
import RetriggerButton from '../Retrigger/RetriggerButton';
import { LoaderReturnValue } from '../subtestsLoader';
import { LoaderReturnValue as OvertimeLoaderReturnValue } from '../subtestsOverTimeLoader';

type SubtestsResultsMainInternalProps = {
  loadedResults: CompareResultsItem[];
  view: typeof subtestsView | typeof subtestsOverTimeView;
  initialSearchTerm: string;
  onSearchTermChange: (term: string) => void;
};

function SubtestsResultsMainInternal({
  loadedResults,
  view,
  initialSearchTerm,
  onSearchTermChange,
}: SubtestsResultsMainInternalProps) {
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
          <RetriggerButton result={loadedResults[0]} variant='text' />
        </Grid>
      </Grid>
    </>
  );
}

type SubtestsResultsMainProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

function SubtestsResultsMain({ view }: SubtestsResultsMainProps) {
  const { results, subtestsViewPerfherderURL } = useLoaderData() as
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

  const {
    palette: { secondary },
  } = useTheme();

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

        <Suspense
          fallback={
            <>
              <Stack spacing={1} sx={{ marginBottom: '12px' }}>
                <Skeleton
                  variant='rounded'
                  sx={{
                    // This fontSize value makes the skeleton match the height of the replaced element.
                    fontSize: '2.18em',
                    backgroundColor: secondary.main,
                  }}
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
                  <Button
                    variant='contained'
                    color='secondary'
                    disabled
                    sx={{
                      height: '41px',
                      flex: 'none',
                      '& .MuiButtonBase-root': {
                        height: '100%',
                        width: '100%',
                      },
                    }}
                  >
                    Download JSON
                  </Button>
                </Grid>
                <Grid item xs='auto'>
                  <Button
                    title='Retrigger test'
                    color='primary'
                    variant='text'
                    startIcon={<RefreshOutlinedIcon />}
                    disabled
                  >
                    Retrigger test
                  </Button>
                </Grid>
              </Grid>
            </>
          }
        >
          <Await resolve={results}>
            {(loadedResults: CompareResultsItem[]) => (
              <SubtestsResultsMainInternal
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
      />
    </Container>
  );
}

export default SubtestsResultsMain;
