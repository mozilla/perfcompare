import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

import { STUDENT_T } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateShowMannWhitneyWarning } from '../../reducers/ColumnPrefsSlice';
import { Strings } from '../../resources/Strings';
import type { TestVersion } from '../../types/types';

const alertSx = {
  width: '100%',
  fontSize: '16px',
};

type TestVersionWarningProps = {
  testVersion: TestVersion;
};

export function TestVersionWarning({ testVersion }: TestVersionWarningProps) {
  const dispatch = useAppDispatch();
  const showMannWhitneyWarning = useAppSelector(
    (state) => state.columnPrefs.showMannWhitneyWarning,
  );

  if (testVersion === STUDENT_T) {
    return (
      <Alert severity='warning' sx={alertSx}>
        {Strings.components.studentTTestWarning.text}
      </Alert>
    );
  }

  if (!showMannWhitneyWarning) {
    return null;
  }

  return (
    <Alert
      severity='warning'
      sx={alertSx}
      onClose={() => dispatch(updateShowMannWhitneyWarning(false))}
    >
      {Strings.components.mannWhitneyUWarning.text}{' '}
      <Link href={Strings.components.mannWhitneyUWarning.href} target='_blank'>
        {Strings.components.mannWhitneyUWarning.linkText}
      </Link>
      {'. '} {Strings.components.mannWhitneyUWarning.text2}{' '}
    </Alert>
  );
}
