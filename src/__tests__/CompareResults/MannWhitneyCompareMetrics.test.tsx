import { within } from '@testing-library/react';

import { MannWhitneyCompareMetrics } from '../../components/CompareResults/MannWhitneyCompareMetrics';
import getTestData from '../utils/fixtures';
import { render, screen } from '../utils/test-utils';

describe('MannWhitneyCompareMetrics units', () => {
  it('uses a common scale for both builds and squared units for variance', () => {
    const { mockMannWhitneyResultData } = getTestData();
    const stats = {
      mean: 2000,
      median: 2000,
      variance: 4000000,
      stddev: 2000,
      min: 1000,
      max: 3000,
    };
    render(
      <MannWhitneyCompareMetrics
        result={{
          ...mockMannWhitneyResultData,
          base_measurement_unit: 'uWh',
          new_measurement_unit: 'uWh',
          base_standard_stats: stats,
          new_standard_stats: { ...stats, mean: 2500 },
        }}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Metric (mWh)' }),
    ).toBeInTheDocument();
    const meanCells = within(
      screen.getByRole('row', { name: /^Mean / }),
    ).getAllByRole('cell');
    expect(meanCells[1]).toHaveTextContent('2.00');
    expect(meanCells[2]).toHaveTextContent('2.50');
    const varianceCells = within(
      screen.getByRole('row', { name: /^Variance / }),
    ).getAllByRole('cell');
    expect(varianceCells[0]).toHaveTextContent('Variance (mWh^2)');
    expect(varianceCells[1]).toHaveTextContent('4.00');
    expect(varianceCells[2]).toHaveTextContent('4.00');
  });
});
