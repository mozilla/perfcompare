import { style } from 'typestyle';

import GraphDistribution from './GraphDistribution';
import { Spacing } from '../../styles';
import { MeasurementUnit } from '../../types/types';
import { formatNumber } from './../../utils/format';

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
  const {
    name,
    avg,
    median,
    values,
    application,
    stddev,
    stddevPercent,
    measurementUnit,
  } = props.revisionRuns;

  const unit = measurementUnit ? `${measurementUnit}` : '';

  return (
    <div className={styles.container}>
      {application ? (
        <div>
          <b>{name}:</b> {formatNumber(median)} {measurementUnit} ({application}
          )
        </div>
      ) : (
        <div>
          <b>{name}:</b> {formatNumber(median)} {measurementUnit}
        </div>
      )}
      <div>
        <GraphDistribution
          name={name}
          values={values}
          min={props.min}
          max={props.max}
        />
      </div>
      <div>
        <div className={styles.values}>
          {values.map((value, index) => (
            <div key={`${index}`} className={styles.value}>
              {formatNumber(value)}
            </div>
          ))}
        </div>
        <div>
          <b>Mean</b>:{'\u00a0'}
          {formatNumber(avg)}
          {measurementUnit},{'\u00a0'}
          <b>Median</b>:{'\u00a0'}
          {formatNumber(median)}
          {measurementUnit}
        </div>
        <div className={styles.deviation}>
          {stddev} {unit} = {stddevPercent}% standard deviation
        </div>
      </div>
    </div>
  );
}
interface RunValuesProps {
  revisionRuns: {
    name: string;
    avg: number;
    median: number;
    values: number[];
    application: string;
    stddev: number;
    stddevPercent: number;
    measurementUnit: MeasurementUnit;
  };
  min: number;
  max: number;
}

export default RunValues;
