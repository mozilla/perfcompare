import { Container } from '@mui/system';
import { style } from 'typestyle';

import ResultsHeader from './ResultsHeader';

const styles = {
  container: style({
    maxWidth: '950px',
    margin: '0 auto',
  }),
};

function ResultsMain() {
  return (
    <Container className={styles.container} data-testid='results-main'>
      <ResultsHeader />
    </Container>
  );
}

export default ResultsMain;
