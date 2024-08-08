import { Chart as ChartJS, LineElement, LinearScale } from 'chart.js';
import 'chart.js/auto';
import * as kde from 'fast-kde';
import { Line } from 'react-chartjs-2';
import { style } from 'typestyle';

import { Spacing } from '../../styles';

ChartJS.register(LinearScale, LineElement);

const styles = {
  container: style({
    display: 'flex',
    marginBottom: Spacing.Medium,
    width: '100%',
  }),
};

function CommonGraph(props: CommonGraphProps) {
  const { baseRevisionRuns, newRevisionRuns, min, max } = props;

  const options = {
    plugins: {
      legend: {
        align: 'start' as const,
        position: 'bottom' as const,
      },
      title: {
        align: 'start' as const,
        display: true,
        text: 'Runs Density Distribution',
      },
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
          offset: false,
        },
        type: 'linear' as const,
        title: {
          align: 'end' as const,
          display: true,
          text: 'Run Result' as const,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          display: false,
          offset: false,
        },
        ticks: {
          beginAtZero: true,
          display: true,
        },
        title: {
          align: 'end' as const,
          display: true,
          text: 'Run Density' as const,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    },
  };

  //////////////////// START FAST KDE ////////////////////////
  const baseRunsDensity = Array.from(
    kde.density1d(baseRevisionRuns.values, {
      bandwidth: baseRevisionRuns.stddev,
      extent: [min, max],
    }),
  );
  const newRunsDensity = Array.from(
    kde.density1d(newRevisionRuns.values, {
      bandwidth: newRevisionRuns.stddev,
      extent: [min, max],
    }),
  );

  //////////////////// END FAST KDE   ////////////////////////

  const data = {
    datasets: [
      {
        label: 'Base',
        data: baseRunsDensity,
        fill: false,
        borderColor: 'rgba(144, 89, 255, 1)',
      },
      {
        label: 'New',
        data: newRunsDensity,
        fill: false,
        borderColor: 'rgba(0, 135, 135, 1)',
      },
    ],
  };

  return (
    <div className={styles.container}>
      {/* @ts-expect-error the types for chart.js do not seem great and do not support all options. */}
      <Line options={options} data={data} />
    </div>
  );
}

interface CommonGraphProps {
  baseRevisionRuns: {
    name: string;
    median: number;
    values: number[];
    stddev: number;
    stddevPercent: number;
  };
  newRevisionRuns: {
    name: string;
    median: number;
    values: number[];
    stddev: number;
    stddevPercent: number;
  };
  min: number;
  max: number;
}

export default CommonGraph;
