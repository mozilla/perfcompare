import { useState } from 'react';

import { Button } from '@mui/material';
import { style } from 'typestyle';

import { Spacing } from '../../styles';
import { MeasurementUnit } from '../../types/types';
import { formatNumber } from './../../utils/format';

const styles = {
  values: style({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: Spacing.Small,
    width: '300px',
    gap: Spacing.xSmall,
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

  const onCopyValues = () => {
    void navigator.clipboard.writeText(values.toString());
  };

  return (
    <>
      {application ? (
        <div>
          <b>{name}:</b> {formatNumber(avg)} {measurementUnit} ({application})
        </div>
      ) : (
        <div>
          <b>{name}:</b> {formatNumber(avg)} {measurementUnit}
        </div>
      )}
      <div className={styles.values}>
        {firstValues.map((value, index) => (
          <div key={`${index}`}>{formatNumber(value)}</div>
        ))}
        {expanded
          ? lastValues.map((value, index) => (
              <div key={`${index}`}>{value}</div>
            ))
          : null}
        {lastValues.length ? (
          <Button variant='text' size='small' onClick={toggleIsExpanded}>
            {expanded ? 'Show less' : `Show ${lastValues.length} more`}
          </Button>
        ) : null}
        {values.length && (
          <Button variant='text' size='small' onClick={onCopyValues}>
            Copy results
          </Button>
        )}
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
        {values.length > 1
          ? `${stddev} ${unit} = ${stddevPercent}% standard deviation`
          : 'N/A standard deviation'}
      </div>
    </>
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
}

export default RunValues;
