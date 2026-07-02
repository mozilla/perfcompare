import { Box } from '@mui/material';

import { MannWhitneyResultsItem } from '../../types/state';
import { getDisplayScale } from '../../utils/format';
import { getModeInterpretation } from '../../utils/helpers';

const METRIC_HEADERS = ['Metric', 'Base', 'New', 'Interpretation'];

interface MannWhitneyCompareMetricsProps {
  result: MannWhitneyResultsItem;
}

export const MannWhitneyCompareMetrics = ({
  result,
}: MannWhitneyCompareMetricsProps) => {
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
  } = result?.base_standard_stats ?? {
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
  } = result?.new_standard_stats ?? {
    mean: null,
    median: null,
    variance: null,
    stddev: null,
    min: null,
    max: null,
  };
  const rawUnit =
    result.base_measurement_unit ?? result.new_measurement_unit ?? 'ms';
  const metricValues = [
    baseMean, newMean, baseMedian, newMedian,
    baseStandardDev, newStandardDev, baseMin, newMin, baseMax, newMax,
  ].filter((v): v is number => v != null);
  const { scale, displayUnit, decimals } = getDisplayScale(metricValues, rawUnit);
  const fmtMetric = (v: number | null | undefined) =>
    v != null ? (v / scale).toFixed(decimals) : 'N/A';
  const unitLabel = displayUnit ? ` (${displayUnit})` : '';

  const baseShapiroWilkPVal = result.shapiro_wilk_test_base?.pvalue ?? 'N/A';
  const newShapiroWilkPVal = result.shapiro_wilk_test_new?.pvalue ?? 'N/A';
  const baseShapiroWilkInterpretation =
    result.shapiro_wilk_test_base?.interpretation ?? 'N/A';
  const newShapiroWilkInterpretation =
    result.shapiro_wilk_test_new?.interpretation ?? 'N/A';
  const baseMode = result?.silverman_kde?.base_mode_count ?? null;
  const newMode = result?.silverman_kde?.new_mode_count ?? null;

  return (
    <Box
      sx={{
        backgroundColor: 'manWhitneyComps.compareMetricsBg',
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
      }}
    >
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
            {METRIC_HEADERS.map((header, i) => (
              <th
                key={header}
                style={{ fontWeight: 'bold', textAlign: 'left' }}
              >
                {i === 0 ? `${header}${unitLabel}` : header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className='test-row-container'>
            <td>Mean</td>
            <td>{fmtMetric(baseMean)}</td>
            <td>{fmtMetric(newMean)}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Median</td>
            <td>{fmtMetric(baseMedian)}</td>
            <td>{fmtMetric(newMedian)}</td>
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
            <td>{fmtMetric(baseStandardDev)}</td>
            <td>{fmtMetric(newStandardDev)}</td>
            <td></td>
          </tr>
          <tr className='test-row-container'>
            <td>Min</td>
            <td>{fmtMetric(baseMin)}</td>
            <td>{fmtMetric(newMin)}</td>
            <td></td>
          </tr>
          <tr className='test-row-container' style={{ marginBottom: 2 }}>
            <td>Max</td>
            <td>{fmtMetric(baseMax)}</td>
            <td>{fmtMetric(newMax)}</td>
            <td></td>
          </tr>
          <tr className='test-label-row'>
            <td>Normality Test</td>
          </tr>
          <tr className='test-row-container'>
            <td>Shapiro-Wilk</td>
            <td>{baseShapiroWilkPVal}</td>
            <td>{newShapiroWilkPVal}</td>
            <td
              style={{
                gridTemplateColumns: '1fr',
                display: 'grid',
                gap: 1,
                flexDirection: 'column',
              }}
            >
              {baseShapiroWilkInterpretation}
              <br />
              {newShapiroWilkInterpretation}
            </td>
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
