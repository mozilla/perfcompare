import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import GraphDistribution from './GraphDistribution';

const styles = {
  container: style({
    width: '300px',
    marginRight: Spacing.xLarge,
  }),
  values: style({
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: Spacing.Small,
    width: '300px',
  }),
  value: style({
    marginRight: Spacing.xSmall,
  }),
  deviation: style({
    textTransform: 'uppercase',
  }),
};

function RunValues(props: RunValuesProps) {
  const { name, median, values, stddev, stddevPercent } = props.revisionRuns;
  return (
    <div className={styles.container}>
      <div>
        <b>{name}:</b> {median} ms
      </div>
      <div>
        <GraphDistribution name={name} values={values} />
      </div>
      <div>
        <div className={styles.values}>
          {values.map((value, index) => (
            <div key={`${index}`} className={styles.value}>
              {value}
            </div>
          ))}
        </div>
        <div className={styles.deviation}>{stddev} = {stddevPercent}% standard deviation</div>
      </div>
    </div>
  );
}
interface RunValuesProps {
  revisionRuns: {
    name: string;
    median: number;
    values: number[];
    stddev: number;
    stddevPercent: number;
  }
}

export default RunValues;
