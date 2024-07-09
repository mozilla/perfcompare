import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
// import CompareWithBase from '../../Search/CompareWithBase';
// import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import type { LoaderReturnValue } from '.././subtestsLoader';
import ResultsMain from './SubtestsResultsMain';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const { results } = useLoaderData() as LoaderReturnValue;
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain results={results} />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
