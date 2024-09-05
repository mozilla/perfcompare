import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import { SelectChangeEvent } from '@mui/material/Select';
import { Container } from '@mui/system';
import { useSearchParams } from 'react-router-dom';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import { Framework } from '../../types/types';
import FrameworkDropdown from '../Shared/FrameworkDropdown';
import DownloadButton from './DownloadButton';
import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

function ResultsMain() {
  const { results, view, frameworkId, generation } = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchParams, setSearchParams] = useSearchParams();

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);

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
    content: style({
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }),
  };

  const onFrameworkChange = (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    setFrameworkIdVal(id);

    searchParams.set('framework', id.toString());
    setSearchParams(searchParams);
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
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <div className={styles.title}>Results</div>
        <Grid container className={styles.content} spacing={2}>
          <Grid item md={6} xs={12}>
            <SearchInput
              defaultValue={initialSearchTerm}
              onChange={onSearchTermChange}
            />
          </Grid>
          <Grid item xs>
            <FormControl sx={{ width: '100%' }}>
              <FrameworkDropdown
                frameworkId={frameworkIdVal}
                size='small'
                variant='outlined'
                onChange={onFrameworkChange}
                mode={themeMode}
              />
            </FormControl>
          </Grid>
          <Grid item xs>
            <RevisionSelect />
          </Grid>
          <Grid item xs>
            <DownloadButton resultsPromise={results} />
          </Grid>
        </Grid>
      </header>
      {/* Using a key in Suspense makes it that it displays the fallback more
          consistently.
          See https://github.com/mozilla/perfcompare/pull/702#discussion_r1705274740
          for more explanation (and questioning) about this issue. */}
      <Suspense
        fallback={
          <Box display='flex' justifyContent='center' sx={{ marginTop: 3 }}>
            <CircularProgress />
          </Box>
        }
        key={generation}
      >
        <Await resolve={results}>
          {(resolvedResults) => (
            <ResultsTable
              filteringSearchTerm={searchTerm}
              results={resolvedResults as CompareResultsItem[][]}
              view={view}
            />
          )}
        </Await>
      </Suspense>
    </Container>
  );
}

export default ResultsMain;
