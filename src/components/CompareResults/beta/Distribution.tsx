import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import RunValues from './RunValues';

const baseRuns = {
  name: 'Base',
  mean: 771.39,
  runValues: [
    305.5, 381, 383.5, 384.5, 384.5, 385.5, 387, 388, 391, 392, 398.5, 402,
    403.5, 406, 408, 422.5, 427, 433, 437, 438, 445,
  ],
};

const newRuns = {
  name: 'New',
  mean: 284.92,
  runValues: [
    200, 200, 204.5, 205.5, 255.5, 258, 267, 283.5, 284.5, 291, 292, 298.5, 302,
    303.5, 306, 308, 322, 327, 337, 338, 400,
  ],
};

const styles = {
  container: style({
    display: 'flex',
    marginBottom: Spacing.Medium,
  }),
  commonGraph: style({
    width: '100%',
  }),
};

function Distribution() {
  return (
    <div className={styles.container}>
      <RunValues revisionRuns={baseRuns} />
      <RunValues revisionRuns={newRuns} />
    </div>
  );
}

export default Distribution;
