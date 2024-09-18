import { Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import { truncateHash } from '../../utils/helpers';
import {
  getOldCompareWithBaseViewURL,
  getOldCompareOvertimeViewURL,
} from '../../utils/helpers';
import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';

function getPunctuationMark(index: number, newRevs: string[]) {
  return index != newRevs.length - 1 ? ', ' : '.';
}

function ResultsMain() {
  const {
    view,
    frameworkId,
    baseRepo,
    baseRev,
    newRepos,
    newRevs,
    intervalValue,
  } = useLoaderData() as LoaderReturnValue | OverTimeLoaderReturnValue;

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
        <div className={styles.title}>Results </div>
        <Alert severity='info' className={styles.title}>
          Perfherder links are available for the same comparisons:{' '}
          {view === `compare-results`
            ? newRevs.map((rev, index) => (
                <>
                  <Link
                    key={rev}
                    href={getOldCompareWithBaseViewURL(
                      baseRepo,
                      baseRev,
                      newRepos[index],
                      rev,
                      frameworkId,
                    )}
                    target='_blank'
                  >
                    {truncateHash(rev)}
                  </Link>
                  {getPunctuationMark(index, newRevs)}
                </>
              ))
            : newRevs.map((rev, index) => (
                <>
                  <Link
                    key={rev}
                    href={getOldCompareOvertimeViewURL(
                      baseRepo,
                      newRepos[index],
                      rev,
                      frameworkId,
                      intervalValue,
                    )}
                    target='_blank'
                  >
                    {truncateHash(rev)}
                  </Link>
                  {getPunctuationMark(index, newRevs)}
                </>
              ))}
        </Alert>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
