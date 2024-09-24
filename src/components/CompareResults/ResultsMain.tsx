import { Fragment } from 'react';

import { Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import {
  getPerfherderCompareWithBaseViewURL,
  getPerfherderCompareOverTimeViewURL,
} from '../../logic/treeherder';
import { Colors, Spacing } from '../../styles';
import { truncateHash } from '../../utils/helpers';
import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';

function getPunctuationMark(index: number, newRevs: string[]) {
  return index != newRevs.length - 1 ? ', ' : '.';
}

function ResultsMain() {
  const loaderData = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

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
    if (loaderData.view === compareView) {
      const { frameworkId, baseRepo, baseRev, newRepos } = loaderData;
      return getPerfherderCompareWithBaseViewURL(
        baseRepo,
        baseRev,
        newRepos[index],
        rev,
        frameworkId,
      );
    } else {
      const { frameworkId, baseRepo, newRepos, intervalValue } = loaderData;
      return getPerfherderCompareOverTimeViewURL(
        baseRepo,
        newRepos[index],
        rev,
        frameworkId,
        intervalValue,
      );
    }
  }

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <div className={styles.title}>Results </div>
        <Alert severity='info' className={styles.title}>
          Perfherder links are available for:{' '}
          {loaderData.newRevs.map((rev, index) => (
            <Fragment key={rev}>
              <Link href={getCompareViewURL(index, rev)} target='_blank'>
                {`comparison ${truncateHash(rev)}`}
              </Link>
              {getPunctuationMark(index, loaderData.newRevs)}
            </Fragment>
          ))}
        </Alert>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
