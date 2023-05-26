
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';


ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const runValues = [
  305.5, 381, 383.5, 384.5, 384.5, 385.5, 387, 388, 391, 392, 398.5, 402, 403.5,
  406, 408, 422.5, 427, 433, 437, 438, 445,
];

const minRunValue = Math.min.apply(Math, runValues);
const maxRunValue = Math.max.apply(Math, runValues);
console.log(minRunValue, ' ', maxRunValue);

const graphData = runValues.map((v) => {
  return { x: v, y: 0, r: 10 };
});

const options = {
  scales: {
    x: {
      grid: {
        display: false,
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
      },
    },
  },
};

const data = {
  datasets: [
    {
      data: graphData,
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
    },
  ],
};

function GraphDistribution() {
  return <Bubble options={options} data={data} />;
}

export default GraphDistribution;
