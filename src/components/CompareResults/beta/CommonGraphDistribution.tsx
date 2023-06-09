import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const runValues1 = [
  305.5, 381, 383.5, 384.5, 384.5, 385.5, 387, 388, 391, 392, 398.5, 402, 403.5,
  406, 408, 422.5, 427, 433, 437, 438, 445,
].sort();

const runValues2 = [
  200, 200, 204.5, 205.5, 255.5, 258, 267, 283.5, 284.5, 291, 292, 298.5, 302,
  303.5, 306, 308, 322, 327, 337, 338, 400,
].sort();

const options = {
  responsive: true,
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

const graphData1 = runValues1.map((v) => {
  return { x: v, y: Math.round(v) };
});

const graphData2 = runValues2.map((v) => {
  return { x: v, y: Math.round(v) };
});

let graphLabels1 = graphData1.map((v) => v.y);

graphLabels1 = graphLabels1.filter((element, index) => {
  return graphLabels1.indexOf(element) === index;
});

let graphLabels2 = graphData2.map((v) => v.y);
graphLabels2 = graphLabels2.filter((element, index) => {
  return graphLabels2.indexOf(element) === index;
});

const remain = graphLabels2.filter((v) => !graphLabels1.includes(v));
const graphLabels = [...graphLabels1, ...remain].sort();

const data = {
  labels: graphLabels,
  datasets: [
    {
      label: 'Base',
      data: graphData1,
      fill: false,
      borderColor: 'rgba(144, 89, 255, 1)',
    },
    {
      label: 'New',
      data: graphData2,
      fill: false,
      borderColor: 'rgba(0, 135, 135, 1)',
    },
  ],
};

function CommonGraphDistribution() {
  return <Line options={options} data={data} />;
}

export default CommonGraphDistribution;
