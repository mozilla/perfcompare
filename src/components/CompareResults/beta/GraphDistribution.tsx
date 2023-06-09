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

function GraphDistribution(props: GraphDistributionProps) {

  const { name, values } = props;

  const graphData = values.map((v) => {
    return { x: v, y: 0, r: 10 };
  });

  const options = {
    plugins: {
      legend: {
        align: 'start' as const,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            console.log(context);
            return `${context.raw.x} ms`;
          }
        },
      },
    },
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
        label: name,
        data: graphData,
        backgroundColor: name.toLowerCase() === 'base' ? 'rgba(144, 89, 255, 0.6)' : 'rgba(0, 135, 135, 0.6)',
      },
    ],
  };

  return <Bubble options={options} data={data} />;
}

interface GraphDistributionProps {
  name: string;
  values: number[];
}

export default GraphDistribution;
