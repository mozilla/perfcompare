import { Box } from '@mui/material';

import { MANN_WHITNEY_U } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { MannWhitneyResultsItem } from '../../types/state';
import { TestVersion } from '../../types/types';
import { getModeInterpretation } from '../../utils/helpers';

const METRIC_HEADERS = ['Metric', 'Base', 'New', 'Interpretation'];

interface MannWhitneyCompareMetricsProps {
  result: MannWhitneyResultsItem;
  testVersion: TestVersion;
}

export const MannWhitneyCompareMetrics = ({
  result,
  testVersion,
}: MannWhitneyCompareMetricsProps) => {
  if (!result || testVersion !== MANN_WHITNEY_U) {
    return null;
  }
  function getStyles(theme: string) {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;

    return {
      backgroundColor,
      marginBottom: 2,
      maxWidth: '85%',
      width: '100%',
      borderRadius: '5px',
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

  const {
    mean: baseMean,
    median: baseMedian,
    variance: baseVariance,
    stddev: baseStandardDev,
    min: baseMin,
    max: baseMax,
  } = result.base_standard_stats ?? {
    mean: null,
    median: null,
    variance: null,
    stddev: null,
    min: null,
    max: null,
  };
  const {
    mean: newMean,
    median: newMedian,
    variance: newVariance,
    stddev: newStandardDev,
    min: newMin,
    max: newMax,
  } = result.new_standard_stats ?? {
    mean: null,
    median: null,
    variance: null,
    stddev: null,
    min: null,
    max: null,
  };
  const baseShapiroWilkInterpretation = result.shapiro_wilk_test_base?.stat
    ? `${result.shapiro_wilk_test_base?.stat} ${result.shapiro_wilk_test_base?.interpretation}`
    : 'N/A';
  const newShapiroWilkInterpretation = result.shapiro_wilk_test_new?.stat
    ? `${result.shapiro_wilk_test_new?.stat} ${result.shapiro_wilk_test_new?.interpretation}`
    : 'N/A';
  const baseMode = result?.silverman_kde?.base_mode_count ?? null;
  const newMode = result?.silverman_kde?.new_mode_count ?? null;

  return (
    <Box sx={{ ...styles[mode] }}>
      <table
        style={{
          display: 'grid',
          grid: '1fr',
          gap: 2,
          flexDirection: 'column',
        }}
      >
        <thead>
          <tr className='test-row-container'>
            {METRIC_HEADERS.map((header) => (
              <th
                key={header}
                style={{ fontWeight: 'bold', textAlign: 'left' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className='test-row-container'>
            <td>Mean</td>
            <td>{baseMean?.toFixed(2) ?? 'N/A'}</td>
            <td>{newMean?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Median</td>
            <td>{baseMedian?.toFixed(2) ?? 'N/A'}</td>
            <td>{newMedian?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Variance</td>
            <td>{baseVariance?.toFixed(2) ?? 'N/A'}</td>
            <td>{newVariance?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Standard Deviation</td>
            <td>{baseStandardDev?.toFixed(2) ?? 'N/A'}</td>
            <td>{newStandardDev?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Min</td>
            <td>{baseMin?.toFixed(2) ?? 'N/A'}</td>
            <td>{newMin?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-row-container' style={{ marginBottom: 2 }}>
            <td>Max</td>
            <td>{baseMax?.toFixed(2) ?? 'N/A'}</td>
            <td>{newMax?.toFixed(2) ?? 'N/A'}</td>
            <td></td>
          </tr>
          <tr className='test-label-row'>
            <td>Normality Test</td>
          </tr>
          <tr className='test-row-container'>
            <td>Shapiro-Wilk</td>
            <td>{baseShapiroWilkInterpretation}</td>
            <td>{newShapiroWilkInterpretation}</td>
            <td
              style={{
                gridTemplateColumns: '1fr',
                display: 'grid',
                gap: 1,
                flexDirection: 'column',
              }}
            >{`${result.shapiro_wilk_test_base?.interpretation || result.shapiro_wilk_test_new?.interpretation}`}</td>
          </tr>
          <tr className='test-label-row'>
            <td>Goodness of Fit Test</td>
          </tr>
          <tr className='test-row-container'>
            <td>Kolmogorov-Smirnov Test</td>
            <td></td>
            <td></td>
            <td>{`${result?.ks_test?.interpretation ?? ''}`}</td>
          </tr>
          <tr className='test-label-row' style={{ marginTop: 2 }}>
            <td>Distribution</td>
          </tr>
          <tr className='test-row-container'>
            <td>Estimated Modes</td>
            <td>{baseMode}</td>
            <td>{newMode}</td>
            <td>{getModeInterpretation(baseMode, newMode)}</td>
          </tr>
        </tbody>
      </table>
    </Box>
  );
};
