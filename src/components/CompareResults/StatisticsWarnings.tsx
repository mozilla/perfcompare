import { Warning } from '@mui/icons-material';
import { Box } from '@mui/system';
import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles';
import { MannWhitneyResultsItem } from '../../types/state';

export const StatisticsWarnings = ({
  result,
}: {
  result: MannWhitneyResultsItem;
}) => {
  function getStyles(theme: string) {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;

    return {
      backgroundColor,
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
  }
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = {
    light: getStyles('light'),
    dark: getStyles('dark'),
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
        <Box sx={{ ...styles[mode] }}>
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