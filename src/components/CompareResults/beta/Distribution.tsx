import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import RunValues from './RunValues';

const styles = {
  container: style({
    display: 'flex',
    marginBottom: Spacing.Medium,
  }),
  commonGraph: style({
    width: '100%',
  }),
};


function Distribution(props: DistributionProps) {
  const { result } = props;
  const { base_runs: baseRuns, new_runs: newRuns, base_median_value: baseMedian, new_median_value: newMedian, base_stddev: baseStddev, new_stddev: newStddev, base_stddev_pct: baseStddevPercent, new_stddev_pct: newStddevPercent  } = result;

  const baseRevisionRuns = {
    name: 'Base',
    median: baseMedian,
    values: baseRuns,
    stddev: baseStddev,
    stddevPercent: baseStddevPercent,
  };

  const newRevisionRuns = {
    name: 'New',
    median: newMedian,
    values: newRuns,
    stddev: newStddev,
    stddevPercent: newStddevPercent,
  };

  return (
    <div className={styles.container}>
      <RunValues revisionRuns={baseRevisionRuns}/>
      <RunValues revisionRuns={newRevisionRuns}/>
    </div>
  );
}

interface DistributionProps {
  result: CompareResultsItem;
}

export default Distribution;
