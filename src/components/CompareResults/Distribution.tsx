import { style } from 'typestyle';

import CommonGraph from './CommonGraph';
import RunValues from './RunValues';
import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';

const styles = {
  container: style({
    display: 'grid',
    gap: Spacing.xLarge,
    gridTemplateColumns: '28% 28% 1fr',
    marginBottom: Spacing.Medium,
  }),
};

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

  const baseRevisionRuns = {
    name: 'Base',
    avg: baseAvg,
    median: baseMedian,
    values:
      baseRunsReplicates && baseRunsReplicates.length
        ? baseRunsReplicates
        : baseRuns,
    application: baseApplication,
    stddev: baseStddev,
    stddevPercent: baseStddevPercent,
    measurementUnit: baseUnit,
  };

  const newRevisionRuns = {
    name: 'New',
    avg: newAvg,
    median: newMedian,
    values:
      newRunsReplicates && newRunsReplicates.length
        ? newRunsReplicates
        : newRuns,
    application: newApplication,
    stddev: newStddev,
    stddevPercent: newStddevPercent,
    measurementUnit: newUnit,
  };

  const [minValue, maxValue] = computeMinMax(
    baseRevisionRuns.values,
    newRevisionRuns.values,
  );

  return (
    <div className={styles.container}>
      <RunValues
        revisionRuns={baseRevisionRuns}
        min={minValue}
        max={maxValue}
      />
      <RunValues revisionRuns={newRevisionRuns} min={minValue} max={maxValue} />
      <CommonGraph
        baseRevisionRuns={baseRevisionRuns}
        newRevisionRuns={newRevisionRuns}
        min={minValue}
        max={maxValue}
      />
    </div>
  );
}

interface DistributionProps {
  result: CompareResultsItem;
}

export default Distribution;
