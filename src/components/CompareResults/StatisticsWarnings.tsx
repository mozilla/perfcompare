import { Warning } from '@mui/icons-material';
import { Box } from '@mui/system';

import { MANN_WHITNEY_U } from '../../common/constants';
import { Colors } from '../../styles';
import { MannWhitneyResultsItem } from '../../types/state';
import { TestVersion } from '../../types/types';

export const StatisticsWarnings = ({
  result,
  testVersion,
}: {
  result: MannWhitneyResultsItem;
  testVersion: TestVersion;
}) => {
  if (testVersion !== MANN_WHITNEY_U) return null;
  const componentStyles = {
    backgroundColor: 'transparent',
    marginTop: 2,
    marginLeft: 1,
    marginRight: 1,
    marginBottom: 2,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    borderRadius: 1,
    padding: 1,
    width: '55%',
    '& .warning-row': {
      verticalAlign: 'bottom',
      display: 'flex',
      marginTop: 1,
      marginBottom: 1,
    },
  };

  // Combine all warnings into a single list
  const warnings: string[] = [
    ...(result?.shapiro_wilk_warnings ?? []),
    ...(result?.silverman_warnings ?? []),
    ...(result?.ks_warning ? [result?.ks_warning] : []),
    ...(result?.kde_warnings ?? []),
  ];
  return (
    <>
      {warnings.length ? (
        <Box sx={componentStyles}>
          {warnings.map((warning) => (
            <span key={warning} className='warning-row'>
              <Warning sx={{ color: Colors.WarningIcon, marginRight: 1 }} />{' '}
              <b>{'Warning:'}</b>&nbsp;{warning}
            </span>
          ))}
        </Box>
      ) : null}
    </>
  );
};
