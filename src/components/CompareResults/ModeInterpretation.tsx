import { Box } from '@mui/material';

import { MANN_WHITNEY_U } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { MannWhitneyResultsItem } from '../../types/state';
import { TestVersion } from '../../types/types';

export const ModeInterpretation = ({
  result,
  testVersion,
}: {
  result: MannWhitneyResultsItem;
  testVersion: TestVersion;
}) => {
  if (!result || !result.silverman_kde || testVersion !== MANN_WHITNEY_U) {
    return null;
  }

  function getStyles(theme: string) {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;

    return {
      backgroundColor,
      display: 'block',
      alignItems: 'center',
      marginLeft: 1,
      marginBottom: '16px',
      borderRadius: '5px',
      padding: 1,
      flexGrow: 1,
    };
  }
  const mode = useAppSelector((state) => state.theme.mode);

  const kdeModes = result.silverman_kde.modes ?? [];
  if (kdeModes.length === 0) {
    kdeModes.push({
      mode_name: 'N/A',
      mode_start: 'N/A',
      mode_end: 'N/A',
      shift: null,
      shift_summary: 'Cannot calculate shift',
    });
  }

  return (
    <Box sx={getStyles(mode)}>
      <table>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={{ padding: 2, verticalAlign: 'top', paddingRight: 12 }}>
              Mode Start{' '}
            </th>
            <th style={{ padding: 2, verticalAlign: 'top', paddingRight: 12 }}>
              Mode End{' '}
            </th>
            <th style={{ padding: 2, verticalAlign: 'top', paddingRight: 12 }}>
              Median Shift
            </th>
            <th style={{ padding: 2, verticalAlign: 'top' }}>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {kdeModes?.map(
            ({ mode_start, mode_end, shift, shift_summary, mode_name }) => (
              <tr style={{ textAlign: 'left' }} key={mode_name}>
                <td style={{ padding: 2, paddingRight: 16 }}>{mode_start}</td>
                <td style={{ padding: 2, paddingRight: 16 }}>{mode_end}</td>
                <td style={{ padding: 2, paddingRight: 16 }}>
                  {shift ?? 'N/A'}
                </td>
                <td style={{ padding: 2 }}>{shift_summary ?? 'N/A'}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </Box>
  );
};
