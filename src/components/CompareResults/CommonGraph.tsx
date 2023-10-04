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

interface GraphRun {
  from: string;
  oxValue: number;
  value: number;
}

const initializeGraph = (graphWidth: number) => {
  const graph = new Array(graphWidth) as GraphRun[];

  for (let index = 0; index < graphWidth; index++) {
    const initialObject = {
      from: '',
      oxValue: 0,
      value: 0,
    };
    graph[index] = initialObject;
  }

  return graph;
};

const addToHist = (
  graph: GraphRun[],
  X: GraphRun,
  index: number,
) => {
  graph[index].from = X.from;
  graph[index].value += Math.exp(-(((index - X.value) / 10) ** 2));
};

const formatDataset = (
  values: GraphRun[],
  maxX: number,
  graph: GraphRun[],
  graphWidth: number,
) => {
  values.forEach((x, index) => {
    addToHist(
      graph,
      { from: x.from, oxValue: x.value, value: (x.value * graphWidth) / maxX },
      index,
    );
  });
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

  const { options } = configGraph();
  const allValues = [...baseRevisionRuns.values, ...newRevisionRuns.values];
  let allResults = baseRevisionRuns.values.map((el) => ({
    from: 'Base',
    value: el,
    oxValue: el,
  }));
  allResults = [...allResults].concat(
    newRevisionRuns.values.map((el) => ({
      from: 'New',
      value: el,
      oxValue: el,
    })),
  );

  const maxX = Math.max(...allValues);
  const labels = [...allValues].sort();

  // problemo
  // graphWidth = 1000 (px)
  // no pixelo
  // https://stackoverflow.com/questions/50005275/chartjs-line-chart-with-different-size-datasets
  const graphWidth = allValues.length;
  const graph = initializeGraph(graphWidth);

  const datasetAll = formatDataset(allResults, maxX, graph, graphWidth);


  const datasetBase = datasetAll.filter(el => el.from == 'Base');
  const datasetNew = datasetAll.filter(el => el.from == 'New');

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
      kkt
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
