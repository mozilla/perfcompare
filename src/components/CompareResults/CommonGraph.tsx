import { Chart as ChartJS, LineElement, LinearScale } from 'chart.js';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import { style } from 'typestyle';

import { Spacing } from '../../styles';

ChartJS.register(LinearScale, LineElement);

const configGraph = () => {
  const options = {
    plugins: {
      legend: {
        align: 'start' as const,
        position: 'top' as const,
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
        ticks: {
          display: false,
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
  return { options };
};

const getGraphWidth = (maxValue: number, minValue: number) => {
  // return 500;
  return Math.round(maxValue - minValue) + 1;
};

const formatDataset = (values: number[], maxX: number, graphWidth: number) => {
  const addToHist = (graph: number[], X: number) => {
    for (let x = 0; x < graphWidth; x++) {
      graph[x] += Math.exp(-(((x - X) / 10) ** 2));
    }
  };

  const graph = new Array(graphWidth).fill(0) as number[];

  values.forEach((x) => addToHist(graph, (x * graphWidth) / maxX));

  console.log('maxX', maxX);

  return graph;
};

const styles = {
  container: style({
    display: 'flex',
    marginBottom: Spacing.Medium,
  }),
};

function CommonGraph(props: CommonGraphProps) {
  const { baseRevisionRuns, newRevisionRuns } = props;
  console.log('baseRevisionRuns ', baseRevisionRuns.values);
  console.log('newRevisionRuns ', newRevisionRuns.values);

  const { options } = configGraph();
  const allValues = [...baseRevisionRuns.values, ...newRevisionRuns.values];
  const maxX = Math.max(...allValues);
  // const minX = Math.min(...allValues);
  const labels = [...allValues];

  // problemo
  // graphWidth = 1000 (px)
  // no pixelo
  // https://stackoverflow.com/questions/50005275/chartjs-line-chart-with-different-size-datasets
  const graphWidth = allValues.length;

  const datasetBase = formatDataset(baseRevisionRuns.values, maxX, graphWidth);
  const datasetNew = formatDataset(newRevisionRuns.values, maxX, graphWidth);

  console.log('datasetBase ', datasetBase);
  console.log('datasetNew ', datasetNew);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Base',
        data: datasetBase,
        fill: false,
        borderColor: 'rgba(144, 89, 255, 1)',
        tension: 0.3,
      },
      {
        label: 'New',
        data: datasetNew,
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
