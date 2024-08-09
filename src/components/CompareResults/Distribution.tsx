import { style } from 'typestyle';

import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import CommonGraph from './CommonGraph';
import RunValues from './RunValues';

const styles = {
  container: style({
    display: 'flex',
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
    base_app: baseApplication,
    new_app: newApplication,
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
    median: baseMedian,
    values: baseRuns,
    application: baseApplication,
    stddev: baseStddev,
    stddevPercent: baseStddevPercent,
    measurementUnit: baseUnit,
  };

  const newRevisionRuns = {
    name: 'New',
    median: newMedian,
    values: newRuns,
    application: newApplication,
    stddev: newStddev,
    stddevPercent: newStddevPercent,
    measurementUnit: newUnit,
  };

  const [minValue, maxValue] = computeMinMax(baseRuns, newRuns);

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
