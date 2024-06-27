import { useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { useAsyncValue } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import DownloadButton from './DownloadButton';
import ResultsTable from './ResultsTable';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

function ResultsMain({ loading }: { loading: boolean }) {
  const loaderData = useAsyncValue();
  const results = loaderData as CompareResultsItem[][];
  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchTerm, setSearchTerm] = useState('');

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
      <header>
        <div className={styles.title}>Results</div>
        <div className={styles.content}>
          <SearchInput onChange={setSearchTerm} />
          <RevisionSelect />
          <DownloadButton results={results} />
        </div>
      </header>

      {loading ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          mb={3}
          mt={3}
        >
          <CircularProgress />
        </Box>
      ) : (
        <ResultsTable results={results} filteringSearchTerm={searchTerm} />
      )}
    </Container>
  );
}

export default ResultsMain;
