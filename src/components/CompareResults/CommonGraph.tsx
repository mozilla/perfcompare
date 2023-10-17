import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  TooltipItem,
} from 'chart.js';
import 'chart.js/auto';
import * as kde from 'fast-kde';
import { Line } from 'react-chartjs-2';
import { style } from 'typestyle';

import { Spacing } from '../../styles';

ChartJS.register(LinearScale, LineElement);

interface GraphData {
  x: number;
  y: number | string;
}

const styles = {
  container: style({
    display: 'flex',
    marginBottom: Spacing.Medium,
    width: '100%',
  }),
};

function CommonGraph(props: CommonGraphProps) {
  const { baseRevisionRuns, newRevisionRuns } = props;

  const options = {
    plugins: {
      legend: {
        align: 'start' as const,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return `${(context.raw as GraphData).y}`;
          },
        },
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          offset: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          display: true,
          beginAtZero: true,
        },
        grid: {
          drawBorder: false,
          display: false,
          offset: false,
        },
      },
    },
  };

  //////////////////// START FAST KDE ////////////////////////
  const baseRunsDensity = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    kde.density1d([...baseRevisionRuns.values], {
      bandwidth: baseRevisionRuns.stddev,
      extent: [
        Math.min(...baseRevisionRuns.values),
        Math.max(...baseRevisionRuns.values),
      ],
    }),
  );
  const newRunsDensity = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    kde.density1d([...newRevisionRuns.values], {
      bandwidth: newRevisionRuns.stddev,
      extent: [
        Math.min(...newRevisionRuns.values),
        Math.max(...newRevisionRuns.values),
      ],
    }),
  );

  //////////////////// END FAST KDE   ////////////////////////

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const baseRunsX = baseRunsDensity.map((point) => point.x);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const newRunsX = newRunsDensity.map((point) => point.x);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const labels = [...new Set([...baseRunsX, ...newRunsX])].sort();

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Base',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        data: baseRunsDensity,
        fill: false,
        borderColor: 'rgba(144, 89, 255, 1)',
        tension: 0.3,
      },
      {
        label: 'New',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        data: newRunsDensity,
        fill: false,
        borderColor: 'rgba(0, 135, 135, 1)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className={styles.container}>
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
}

export default CommonGraph;
