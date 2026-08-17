import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import {
  updateShowHowToRead,
  HOW_TO_READ_STORAGE_KEY,
} from '../../reducers/ColumnPrefsSlice';

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
    localStorage.setItem(HOW_TO_READ_STORAGE_KEY, 'false');
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
          <strong>No change</strong>.
        </li>
        <li>
          <strong>Magnitude</strong> says how big the difference is: negligible,
          small, medium, or large. Sort or filter by it to focus on the biggest
          changes.
        </li>
        <li>
          <strong>Significance</strong> tells you whether the difference is
          likely a <strong>Real</strong> change or just <strong>Noise </strong>
          (random run-to-run variation).
        </li>
        <li>
          Tick <strong>Advanced columns</strong> to add the expert stats
          (Cliff&apos;s Delta and CLES).
        </li>
      </Box>
    </Alert>
  );
}

export default HowToReadResults;
