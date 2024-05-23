import { Container } from '@mui/system';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import DownloadButton from './DownloadButton';
import ResultsTable from './ResultsTable';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

function ResultsMain(props: { results: CompareResultsItem[][] }) {
  const themeMode = useAppSelector((state) => state.theme.mode);
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

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <div className={styles.title}>Results</div>
        <div className={styles.content}>
          <SearchInput />
          <RevisionSelect />
          <DownloadButton />
        </div>
      </header>
      <ResultsTable results={results} />
    </Container>
  );
}

export default ResultsMain;
