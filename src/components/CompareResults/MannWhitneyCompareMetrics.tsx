import { Typography } from '@mui/material';
import { Box } from '@mui/system';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { MannWhitneyResultsItem } from '../../types/state';

const METRIC_HEADERS = ['Metric', 'Base', 'New', 'Interpretation'];

interface MannWhitneyCompareMetricsProps {
  result: MannWhitneyResultsItem;
}

export const MannWhitneyCompareMetrics = ({
  result,
}: MannWhitneyCompareMetricsProps) => {
  function getStyles(theme: string) {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;

    return {
      backgroundColor,
      marginTop: 4,
      marginBottom: 4,
      display: 'grid',
      grid: '1fr',
      gap: 2,
      flexDirection: 'column',
      width: '100%',
      borderRadius: 1,
      padding: 2,
      '& .test-row-container': {
        gridTemplateColumns: '1.5fr 1fr 1fr 2fr',
        display: 'grid',
        gap: 2,
      },
      '& .test-label-row': {
        fontWeight: 'bold',
        width: '100%',
      },
    };
  }

  const mode = useAppSelector((state) => state.theme.mode);
  const styles = {
    light: getStyles('light'),
    dark: getStyles('dark'),
  };

  if (!result) {
    return null;
  }
  const {
    mean: baseMean,
    median: baseMedian,
    variance: baseVariance,
    stddev: baseStandardDev,
    min: baseMin,
    max: baseMax,
  } = result.base_standard_stats;
  const {
    mean: newMean,
    median: newMedian,
    variance: newVariance,
    stddev: newStandardDev,
    min: newMin,
    max: newMax,
  } = result.new_standard_stats;
  const baseShapiroWilkInterpretation = result?.shapiro_wilk_test_base?.stat
    ? `${result?.shapiro_wilk_test_base?.stat} ${result.shapiro_wilk_test_base?.interpretation}`
    : 'N/A';
  const newShapiroWilkInterpretation = result?.shapiro_wilk_test_new?.stat
    ? `${result?.shapiro_wilk_test_new?.stat} ${result.shapiro_wilk_test_new?.interpretation}`
    : 'N/A';
  const baseMode = result.silverman_kde.base_mode_count;
  const newMode = result.silverman_kde.new_mode_count;
  return (
    <Box sx={{ ...styles[mode] }}>
      <Box className='test-row-container'>
        {METRIC_HEADERS.map((header) => (
          <Typography key={header} sx={{ fontWeight: 'bold' }}>
            {header}
          </Typography>
        ))}
      </Box>
      <Box className='test-row-container'>
        <Typography>Mean</Typography>
        <Typography>{baseMean?.toFixed(2)}</Typography>
        <Typography>{newMean?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Box className='test-row-container'>
        <Typography>Median</Typography>
        <Typography>{baseMedian?.toFixed(2)}</Typography>
        <Typography>{newMedian?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Box className='test-row-container'>
        <Typography>Variance</Typography>
        <Typography>{baseVariance?.toFixed(2)}</Typography>
        <Typography>{newVariance?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Box className='test-row-container'>
        <Typography>Standard Deviation</Typography>
        <Typography>{baseStandardDev?.toFixed(2)}</Typography>
        <Typography>{newStandardDev?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Box className='test-row-container'>
        <Typography>Min</Typography>
        <Typography>{baseMin?.toFixed(2)}</Typography>
        <Typography>{newMin?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Box className='test-row-container' sx={{ marginBottom: 2 }}>
        <Typography>Max</Typography>
        <Typography>{baseMax?.toFixed(2)}</Typography>
        <Typography>{newMax?.toFixed(2)}</Typography>
        <div></div>
      </Box>
      <Typography className='test-label-row'>Normality Test</Typography>
      <Box className='test-row-container'>
        <Typography>Shapiro-Wilk</Typography>
        <Typography>{baseShapiroWilkInterpretation}</Typography>
        <Typography>{newShapiroWilkInterpretation}</Typography>
        <Box
          sx={{
            gridTemplateColumns: '1fr',
            display: 'grid',
            gap: 1,
            flexDirection: 'column',
          }}
        >
          <div>{`${result.shapiro_wilk_test_base?.interpretation || result.shapiro_wilk_test_new?.interpretation}`}</div>
        </Box>
      </Box>
      <Typography className='test-label-row'>Goodness of Fit Test</Typography>
      <Box className='test-row-container'>
        <Typography>Kolmogorov-Smirnov Test</Typography>
        <div></div>
        <div></div>
        <Typography>{`${result?.ks_test?.interpretation ?? null}`}</Typography>
      </Box>
      <Typography className='test-label-row' sx={{ marginTop: 2 }}>
        Distribution
      </Typography>
      <Box className='test-row-container'>
        <Typography>Estimated Modes</Typography>
        <Typography>{baseMode}</Typography>
        <Typography>{newMode}</Typography>
        <div>
          {
            <Typography>
              {result?.silverman_kde?.mode_summary ?? null}
            </Typography>
          }
        </div>
      </Box>
    </Box>
  );
};
