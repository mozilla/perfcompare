import Grid from '@mui/material/Grid';

import CommonGraph from './CommonGraph';
import RunValues from './RunValues';
import type { CompareResultsItem } from '../../types/state';

function computeMinMax(
  baseRuns: number[],
  newRuns: number[],
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const value of baseRuns) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  for (const value of newRuns) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  // Add some grace value of 5%
  min = min * 0.95;
  max = max * 1.05;
  return [min, max];
}

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

  const [minValue, maxValue] = computeMinMax(baseValues, newValues);
  const scaleUnit = baseUnit || newUnit;
  return (
    <Grid container spacing={4} sx={{ marginBottom: 2 }}>
      <Grid item xs={12} sm={6} md={4}>
        <RunValues
          revisionRuns={baseRevisionRuns}
          min={minValue}
          max={maxValue}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <RunValues
          revisionRuns={newRevisionRuns}
          min={minValue}
          max={maxValue}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={4}>
        <CommonGraph
          baseValues={baseValues}
          newValues={newValues}
          min={minValue}
          max={maxValue}
          unit={scaleUnit}
        />
      </Grid>
    </Grid>
  );
}

interface DistributionProps {
  result: CompareResultsItem;
}

export default Distribution;
