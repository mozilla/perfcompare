import { Container } from '@mui/system';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import ResultsHeader from './ResultsHeader';
import ResultsTable from './ResultsTable';

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
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <ResultsHeader />
      <ResultsTable results={results} />
    </Container>
  );
}

export default ResultsMain;
