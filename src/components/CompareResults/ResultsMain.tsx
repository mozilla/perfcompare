import { Fragment, useState } from 'react';

import { Input, Link } from '@mui/material';
import { Grid } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import {
  getPerfherderCompareWithBaseViewURL,
  getPerfherderCompareOverTimeViewURL,
} from '../../logic/treeherder';
import { Colors, FontsRaw, Spacing } from '../../styles';
import { truncateHash } from '../../utils/helpers';
import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';

function getPunctuationMark(index: number, newRevs: string[]) {
  return index != newRevs.length - 1 ? ', ' : '.';
}

function ResultsMain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resultsTitle, setResultsTitle] = useState(
    searchParams.get('title') || 'Results',
  );

  const handleResultsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setResultsTitle(newTitle);
    setSearchParams((prev) => {
      prev.set('title', newTitle);
      return prev;
    });
  };

  const loaderData = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const { view } = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

  const styles = {
    alert: style({
      width: '100%',
    }),
    container: style({
      backgroundColor: themeColor100,
      margin: '0 auto',
      marginBottom: '80px',
    }),
    titleInput: style({
      ...FontsRaw.HeadingXS,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      margin: 0,
    }),
    subtitle: style({
      ...FontsRaw.BodyDefault,
      fontSize: '15px',
      lineHeight: '20px',
      borderLeft: '1px solid #5B5B66',
      paddingLeft: '9px',
    }),
    titleContainer: style({
      alignItems: 'center',
      gap: '9px',
      margin: `0 0 ${Spacing.Medium}px 0`,
    }),
    screenReaderOnly: style({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      border: '0',
    }),
  };

  const subtitles = {
    'compare-results': 'Compare with a base',
    'compare-over-time-results': 'Compare over time',
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
        <Grid container className={styles.titleContainer} component='h2'>
          <Grid item>
            <label htmlFor='results-title' className={styles.screenReaderOnly}>
              Results Title
            </label>
            <Input
              id='results-title'
              type='text'
              name='results-title'
              value={resultsTitle}
              onChange={handleResultsChange}
              className={styles.titleInput}
            />
          </Grid>
          <Grid item className={styles.subtitle}>
            {subtitles[view]}
          </Grid>
        </Grid>
        <Grid container className={styles.titleContainer} component='h2'>
          <Alert severity='info' className={styles.alert}>
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
        </Grid>
      </header>
      <ResultsTable />
    </Container>
  );
}
export default ResultsMain;
