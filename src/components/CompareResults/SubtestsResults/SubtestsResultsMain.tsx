import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Container } from '@mui/system';
import { Await, useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { Colors, Spacing } from '../../../styles';
import type { SubtestsRevisionsHeader } from '../../../types/state';
import DownloadButton from '.././DownloadButton';
import type { LoaderReturnValue } from '.././loader';
import SearchInput from '.././SearchInput';
import SubtestsResultsTable from './SubtestsResultsTable';
import SubtestsRevisionHeader from './SubtestsRevisionHeader';

function SubtestsResultsMain() {
  const { results } = useLoaderData() as LoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchTerm, setSearchTerm] = useState('');

  const subtestsHeader: SubtestsRevisionsHeader = {
    suite: results[0].suite,
    framework_id: results[0].framework_id,
    test: results[0].test,
    option_name: results[0].option_name,
    extra_options: results[0].extra_options,
    new_rev: results[0].new_rev,
    new_repo: results[0].new_repository_name,
    platform: results[0].platform,
  };

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
    <Container className={styles.container} data-testid='subtests-main'>
      <Suspense
        fallback={
          <Box display='flex' justifyContent='center'>
            <CircularProgress />
          </Box>
        }
      >
        <Await resolve={results}>
          <header>
            <SubtestsRevisionHeader header={subtestsHeader} />
            <div className={styles.content}>
              <SearchInput onChange={setSearchTerm} />
              <DownloadButton />
            </div>
          </header>
          <SubtestsResultsTable filteringSearchTerm={searchTerm} />
        </Await>
      </Suspense>
    </Container>
  );
}

export default SubtestsResultsMain;
