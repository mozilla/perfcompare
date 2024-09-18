import { Fragment } from 'react';

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

  function getCompareViewURL(index: number, rev: string): string | undefined {
    if (view === `compare-results`)
      return getOldCompareWithBaseViewURL(
        baseRepo,
        baseRev,
        newRepos[index],
        rev,
        frameworkId,
      );
    else
      return getOldCompareOvertimeViewURL(
        baseRepo,
        newRepos[index],
        rev,
        frameworkId,
        intervalValue,
      );
  }
  console.log(newRevs);
  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <div className={styles.title}>Results </div>
        <Alert severity='info' className={styles.title}>
          Perfherder links are available for:{' '}
          {newRevs.map((rev, index) => (
            <Fragment key={truncateHash(rev)}>
              <Link href={getCompareViewURL(index, rev)} target='_blank'>
                {`comparison ${truncateHash(rev)}`}
              </Link>
              {getPunctuationMark(index, newRevs)}
            </Fragment>
          ))}
        </Alert>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
