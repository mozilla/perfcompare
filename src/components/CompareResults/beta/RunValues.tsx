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
  const { name, mean, runValues: values } = props.revisionRuns;
  return (
    <div className={styles.container}>
      <div>
        <b>{name}:</b> {mean}ms
      </div>
      <div>
        <GraphDistribution name={name} values={values} />
      </div>
      <div>
        <div className={styles.values}>
          {values.map((v, index) => (
            <div key={`${v}-${index}`} className={styles.value}>
              {v}
            </div>
          ))}
        </div>
        <div className={styles.deviation}>21.27=5.27% standard deviation</div>
      </div>
    </div>
  );
}
interface RunValuesProps {
  revisionRuns: {
    name: string;
    mean: number;
    runValues: number[];
  };
}

export default RunValues;
