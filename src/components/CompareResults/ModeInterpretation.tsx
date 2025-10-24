import { Box } from '@mui/material';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { MannWhitneyResultsItem } from '../../types/state';
import { TestVersion } from '../../types/types';
import { MANN_WHITNEY_U } from '../../common/constants';

export const ModeInterpretation = ({result, testVersion}:{result: MannWhitneyResultsItem, testVersion: TestVersion}) => {
  if (!result || !result.silverman_kde || testVersion !== MANN_WHITNEY_U) {
    return null;
  }

  function getStyles(theme: string) {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;

    return {
      backgroundColor,
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr 2fr',
      gap: '10px',
      alignItems: 'center',
    };
  }
  const mode = useAppSelector((state) => state.theme.mode);
  return (
    <Box sx={getStyles(mode)}>
      <table
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 2fr',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <thead>
          <td>
            <tr></tr>
            <tr>Median Shift</tr>
            <tr>Interpretation</tr>
          </td>
        </thead>
        <tbody>
          <td>
            <tr>{result.silverman_kde.mode_summary}</tr>
            <tr>{result.silverman_kde.shift}</tr>
            <tr>{result.silverman_kde.shift_summary ?? 'No significant shift'}</tr>
          </td>
        </tbody>
      </table>
    </Box>
  );
};