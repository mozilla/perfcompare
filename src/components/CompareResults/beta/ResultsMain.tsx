import { Container } from '@mui/system';
import { style } from 'typestyle';

import { Colors } from '../../../styles';
import type { ThemeMode } from '../../../types/state';
import ResultsHeader from './ResultsHeader';
import ResultsTable from './ResultsTable';

function ResultsMain(props: ResultsMainProps) {
  const { themeMode } = props;

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
      <ResultsTable themeMode={themeMode} />
    </Container>
  );
}

interface ResultsMainProps {
  themeMode: ThemeMode;
}

export default ResultsMain;
