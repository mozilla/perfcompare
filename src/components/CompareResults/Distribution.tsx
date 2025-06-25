import Grid from '@mui/material/Grid';

import RunValues from './RunValues';
import type { CompareResultsItem } from '../../types/state';

function Distribution(props: DistributionProps) {
  const { result } = props;
  const {
    base_runs: baseRuns,
    new_runs: newRuns,
    base_runs_replicates: baseRunsReplicates,
    new_runs_replicates: newRunsReplicates,
    base_app: baseApplication,
    new_app: newApplication,
    base_avg_value: baseAvg,
    new_avg_value: newAvg,
    base_median_value: baseMedian,
    new_median_value: newMedian,
    base_stddev: baseStddev,
    new_stddev: newStddev,
    base_stddev_pct: baseStddevPercent,
    new_stddev_pct: newStddevPercent,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
  } = result;

  const baseValues =
    baseRunsReplicates && baseRunsReplicates.length
      ? baseRunsReplicates
      : baseRuns;

  const baseRevisionRuns = {
    name: 'Base',
    avg: baseAvg,
    median: baseMedian,
    values: baseValues,
    application: baseApplication,
    stddev: baseStddev,
    stddevPercent: baseStddevPercent,
    measurementUnit: baseUnit,
  };

  const newValues =
    newRunsReplicates && newRunsReplicates.length ? newRunsReplicates : newRuns;

  const newRevisionRuns = {
    name: 'New',
    avg: newAvg,
    median: newMedian,
    values: newValues,
    application: newApplication,
    stddev: newStddev,
    stddevPercent: newStddevPercent,
    measurementUnit: newUnit,
  };

  return (
    <Grid container spacing={4} sx={{ marginBottom: 2 }}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <RunValues revisionRuns={baseRevisionRuns} />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <RunValues revisionRuns={newRevisionRuns} />
      </Grid>
    </Grid>
  );
}

interface DistributionProps {
  result: CompareResultsItem;
}

export default Distribution;
