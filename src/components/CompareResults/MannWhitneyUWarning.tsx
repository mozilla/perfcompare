import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateShowMannWhitneyWarning } from '../../reducers/ColumnPrefsSlice';
import { Strings } from '../../resources/Strings';

// Dismissible warning about the Mann-Whitney-U test; renders nothing once the
// user has dismissed it.
function MannWhitneyUWarning({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const showMannWhitneyWarning = useAppSelector(
    (state) => state.columnPrefs.showMannWhitneyWarning,
  );

  if (!showMannWhitneyWarning) {
    return null;
  }

  return (
    <Alert
      severity='warning'
      className={className}
      onClose={() => dispatch(updateShowMannWhitneyWarning(false))}
    >
      {Strings.components.mannWhitneyUWarning.text}{' '}
      <Link href={Strings.components.mannWhitneyUWarning.href} target='_blank'>
        {Strings.components.mannWhitneyUWarning.linkText}
      </Link>
      {Strings.components.mannWhitneyUWarning.text2}
    </Alert>
  );
}

export default MannWhitneyUWarning;
