import { Container } from '@mui/system';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import ResultsTable from './ResultsTable';

function ResultsMain() {
  const themeMode = useAppSelector((state) => state.theme.mode);

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
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <div className={styles.title}>Results</div>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
