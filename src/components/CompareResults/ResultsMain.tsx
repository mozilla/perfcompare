import { useState, lazy } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import DownloadButton from './DownloadButton';
import type { LoaderReturnValue } from './loader';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

const ResultsTable = lazy(() => import('./ResultsTable'));

function ResultsMain(props: { isLoadingResults: boolean }) {
  const { results } = useLoaderData() as LoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchTerm, setSearchTerm] = useState('');

  const { isLoadingResults } = props;

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

  return (
    <Container className={styles.container} data-testid='results-main'>
      <Await resolve={results}>
        <header>
          <div className={styles.title}>Results</div>
          <div className={styles.content}>
            <SearchInput onChange={setSearchTerm} />
            <RevisionSelect />
            <DownloadButton />
          </div>
        </header>

        {isLoadingResults ? (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='300px'
          >
            <CircularProgress />
          </Box>
        ) : (
          <ResultsTable filteringSearchTerm={searchTerm} />
        )}
      </Await>
    </Container>
  );
}

export default ResultsMain;
