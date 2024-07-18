import { Suspense, useState } from 'react';

import { SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
// import type { CompareResultsItem } from '../../types/state';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [frameWorkId, setframeWorkValue] = useState(frameworkId);

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

  //add funtionality to refetch data
  //with updated frameworkId

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
              <FrameworkDropdown
                frameworkId={frameWorkId}
                onChange={(event: SelectChangeEvent) => {
                  const id = +event.target.value as Framework['id'];
                  setframeWorkValue(id);
                }}
              />
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
