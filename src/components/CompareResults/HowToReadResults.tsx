import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateShowHowToRead } from '../../reducers/ColumnPrefsSlice';

// Beginner-friendly guide shown above the results table, explaining what each
// column means in plain language.
function HowToReadResults() {
  const dispatch = useAppDispatch();
  const showHowToRead = useAppSelector(
    (state) => state.columnPrefs.showHowToRead,
  );

  if (!showHowToRead) {
    return null;
  }

  const onClose = () => {
    dispatch(updateShowHowToRead(false));
  };

  return (
    <Alert
      severity='info'
      onClose={onClose}
      data-testid='how-to-read-results'
      sx={{ mb: 2 }}
    >
      <AlertTitle>How to read the results</AlertTitle>
      <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
        <li>
          Each row is one <strong>platform</strong>. <strong>Base</strong> is
          the old build; <strong>New</strong> is your change.
        </li>
        <li>
          <strong>Base</strong> and <strong>New</strong> show the average result
          for each build, in the test&apos;s unit.
        </li>
        <li>
          <strong>Δ Median %</strong> shows how much the middle result moved
          from Base to New. A plus sign means New is higher; a minus sign means
          New is lower.
        </li>
        <li>
          <strong>Status</strong> says whether the change is an{' '}
          <strong>Improvement</strong>, a <strong>Regression</strong>, or{' '}
          <strong>No change</strong>. If a result is likely just{' '}
          <strong>Noise</strong> (random run-to-run variation) rather than a
          real change, a &ldquo;Noise&rdquo; tag appears above the status — use
          the Status filter to hide or focus on the noisy rows.
        </li>
        <li>
          <strong>Magnitude</strong> says how big the difference is: negligible,
          small, medium, or large. Sort or filter by it to focus on the biggest
          changes.
        </li>
        <li>
          Use <strong>Advanced options</strong> to add these expert stats as
          extra columns:
          <Box component='ul' sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
            <li>
              <strong>Cliff&apos;s Delta</strong> (header: <strong>CD</strong>)
              is the number behind Magnitude, so it takes the Magnitude
              column&apos;s place. It runs from -1 to 1: a score near 0 means
              little difference, and a score above 0.47 or below -0.47 means a
              large one. A negative score means New values are usually higher.
            </li>
            <li>
              <strong>CLES</strong> (Common Language Effect Size) is shown as a
              percentage: the chance that a New value is lower than a Base
              value. Near 50% means New and Base are about equally likely to be
              higher; the farther from 50%, the clearer the difference.
            </li>
            <li>
              <strong>Significance</strong> (header: <strong>Sig</strong> when
              space is tight) says whether the difference is{' '}
              <strong>Real</strong> or just <strong>Noise</strong>, based on a
              Mann-Whitney U test — &ldquo;Real&rdquo; means a p-value under
              0.05. It&apos;s the same signal as the &ldquo;Noise&rdquo; tag on
              Status, as its own sortable, filterable column.
            </li>
          </Box>
        </li>
      </Box>
    </Alert>
  );
}

export default HowToReadResults;
