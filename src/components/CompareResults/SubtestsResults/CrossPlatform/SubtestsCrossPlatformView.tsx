import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import SubtestsCrossPlatformMain from './SubtestsCrossPlatformMain';
import { useAppSelector } from '../../../../hooks/app';
import { background } from '../../../../styles';
import PerfCompareHeader from '../../../Shared/PerfCompareHeader';

interface SubtestsCrossPlatformViewProps {
  title: string;
}

function SubtestsCrossPlatformView({ title }: SubtestsCrossPlatformViewProps) {
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
      data-testid='subtests-cross-platform-results'
    >
      <PerfCompareHeader />
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid size={12}>
          <SubtestsCrossPlatformMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsCrossPlatformView;
