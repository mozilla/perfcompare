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

  return (
    <Box sx={getStyles(mode)}>
      <table>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={{ padding: 2, paddingRight: 16 }}></th>
            <th style={{ padding: 2, paddingRight: 16 }}>Median Shift</th>
            <th style={{ padding: 2 }}>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ textAlign: 'left' }}>
            <td style={{ padding: 2, paddingRight: 16 }}>
              {result.silverman_kde.mode_summary}
            </td>
            <td style={{ padding: 2, paddingRight: 16 }}>
              {result.silverman_kde.shift ?? +0}
            </td>
            <td style={{ padding: 2 }}>
              {result.silverman_kde.shift_summary ?? 'No significant shift'}
            </td>
          </tr>
        </tbody>
      </table>
    </Box>
  );
};
