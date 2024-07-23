import { Suspense, useEffect, useState } from 'react';

import { SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { useSearchParams } from 'react-router-dom';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
// import type { CompareResultsItem } from '../../types/state';
import { Repository } from '../../types/state';
import { Framework } from '../../types/types';
import DownloadButton from './DownloadButton';
import type { LoaderReturnValue } from './loader';
import FrameworkDropdown from './ResultsFrameWorkDropDown';
import ResultsTable from './ResultsTable';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

function ResultsMain() {
  const { results, frameworkId } = useLoaderData() as LoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);

  // allows user to see the loading spinner
  // for a short time when changing frameworks
  useEffect(() => {
    const waitForResults = async () => {
      await results;
      setTimeout(() => {
        setIsLoading(false);
      }, 50);
    };

    void waitForResults();
  }, [isLoading]);

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

  type SearchParamsType = {
    [key: string]:
      | string
      | string[]
      | Framework['id']
      | Framework['name']
      | Repository['name'];
  };

  const onFrameworkChange = (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    setFrameworkIdVal(id);
    const searchParamsObject = {} as SearchParamsType;
    searchParams.forEach((_, key) => {
      const values = searchParams.getAll(key);
      // account for revs and repos being arrays
      if (values.length > 1) {
        searchParamsObject[key] = values;
      } else {
        searchParamsObject[key] = values[0];
      }
    });

    setSearchParams({ ...searchParamsObject, framework: id.toString() });
    setIsLoading(true);
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <Suspense
        fallback={
          <Box display='flex' justifyContent='center'>
            <CircularProgress />
          </Box>
        }
      >
        <Await resolve={results}>
          <header>
            <div className={styles.title}>Results</div>
            <div className={styles.content}>
              <SearchInput onChange={setSearchTerm} />
              {isLoading ? (
                <Box display='flex' sx={{ margin: 'auto' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <FrameworkDropdown
                  frameworkId={frameworkIdVal}
                  onChange={onFrameworkChange}
                />
              )}

              <RevisionSelect />

              <DownloadButton />
            </div>
          </header>
          <ResultsTable filteringSearchTerm={searchTerm} />
        </Await>
      </Suspense>
    </Container>
  );
}

export default ResultsMain;
