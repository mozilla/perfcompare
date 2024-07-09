import { useState } from 'react';

import { Container } from '@mui/system';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import DownloadButton from '.././DownloadButton';
import SearchInput from '.././SearchInput';
import ResultsTable from './SubtestsResultsTable';
import RevisionHeader from './SubtestsRevisionHeader';

function ResultsMain(props: { results: CompareResultsItem[][] }) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const [searchTerm, setSearchTerm] = useState('');
  const { results } = props;

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

  const header = {
    suite: results[0].suite,
    framework_id: results[0].framework_id,
    test: results[0].test,
    option_name: results[0].option_name,
    extra_options: results[0].extra_options,
    new_rev: results[0].new_rev,
    new_repo: results[0].new_repo,
    platform: results[0].platform,
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <RevisionHeader header={header} />
        <div className={styles.content}>
          <SearchInput onChange={setSearchTerm} />
          <DownloadButton />
        </div>
      </header>
      <ResultsTable results={results} filteringSearchTerm={searchTerm} />
    </Container>
  );
}

export default ResultsMain;
