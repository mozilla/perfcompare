import { Warning } from '@mui/icons-material';
import { Box } from '@mui/system';

import { Colors } from '../../styles';
import { MannWhitneyResultsItem } from '../../types/state';

export const StatisticsWarnings = ({
  result,
}: {
  result: MannWhitneyResultsItem;
}) => {
  const componentStyles = {
    backgroundColor: 'transparent',
    marginTop: 2,
    marginBottom: 2,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    borderRadius: 1,
    padding: 2,
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
    ...(result?.silverman_warnings ?? []),
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
