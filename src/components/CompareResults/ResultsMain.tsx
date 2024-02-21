import { Container } from '@mui/system';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles';
import ResultsHeader from './ResultsHeader';
import ResultsTable from './ResultsTable';

function ResultsMain() {
  const themeMode = useAppSelector((state) => state.theme.mode);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const styles = {
    container: style({
      backgroundColor: themeColor100,
      maxWidth: '950px',
      margin: '0 auto',
      marginBottom: '80px',
    }),
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <ResultsHeader />
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
