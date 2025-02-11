import { useState } from 'react';

import { Button } from '@mui/material';
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
    alignItems: 'center',
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
  const displayedValues = 100;
  const firstValues = values.slice(0, displayedValues);
  const lastValues = values.slice(displayedValues);

  const [expanded, setExpanded] = useState(false);
  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={styles.container}>
      {application ? (
        <div>
          <b>{name}:</b> {formatNumber(avg)} {measurementUnit} ({application})
        </div>
      ) : (
        <div>
          <b>{name}:</b> {formatNumber(avg)} {measurementUnit}
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
          {firstValues.map((value, index) => (
            <div key={`${index}`} className={styles.value}>
              {formatNumber(value)}
            </div>
          ))}
          {expanded
            ? lastValues.map((value, index) => (
                <div key={`${index}`} className={styles.value}>
                  {value}
                </div>
              ))
            : null}
          {lastValues.length ? (
            <Button variant='text' size='small' onClick={toggleIsExpanded}>
              {expanded ? 'Show less' : `Show ${lastValues.length} more`}
            </Button>
          ) : null}
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
