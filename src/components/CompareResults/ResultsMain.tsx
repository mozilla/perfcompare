import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import { SelectChangeEvent } from '@mui/material/Select';
import { Container } from '@mui/system';
import { useSearchParams } from 'react-router-dom';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
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
  const { results, view, frameworkId } = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

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

  const sxStyles = {
    marginRight: 2,
    marginLeft: 2,
  };

  const onFrameworkChange = (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    setFrameworkIdVal(id);

    searchParams.set('framework', id.toString());
    setSearchParams(searchParams);
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
          {(resolvedResults) => (
            <>
              <header>
                <div className={styles.title}>Results</div>
                <div className={styles.content}>
                  <SearchInput onChange={setSearchTerm} />
                  <FormControl>
                    <FrameworkDropdown
                      frameworkId={frameworkIdVal}
                      sxStyles={sxStyles}
                      size='small'
                      variant='outlined'
                      onChange={onFrameworkChange}
                    />
                  </FormControl>
                  <RevisionSelect />
                  <DownloadButton />
                </div>
              </header>
              <ResultsTable
                filteringSearchTerm={searchTerm}
                results={resolvedResults as CompareResultsItem[][]}
                view={view}
              />
            </>
          )}
        </Await>
      </Suspense>
    </Container>
  );
}

export default ResultsMain;
