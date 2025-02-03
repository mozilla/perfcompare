import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import SubtestsResultsMain from './SubtestsResultsMain';
import { subtestsView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';

interface ResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: ResultsViewProps) {
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
      data-testid='beta-version-compare-subtests-results'
    >
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <SubtestsResultsMain view={subtestsView} />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsResultsView;
