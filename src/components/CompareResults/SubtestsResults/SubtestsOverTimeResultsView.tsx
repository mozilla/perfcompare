import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import SubtestsResultsMain from './SubtestsResultsMain';

interface SubtestsResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: SubtestsResultsViewProps) {
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
    <div className={styles.container}>
      <PerfCompareHeader />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <SubtestsResultsMain view={subtestsOverTimeView} />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsResultsView;
