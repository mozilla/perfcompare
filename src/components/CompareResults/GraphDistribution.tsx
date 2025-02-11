import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface GraphContextRaw {
  x: number;
  y: number;
  r: number;
}

function GraphDistribution(props: GraphDistributionProps) {
  const { name, baseValues, newValues, min, max } = props;

  const baseData = baseValues.map((v) => {
    return { x: v, y: 1, r: 10 };
  });
  const newData = newValues.map((v) => {
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
          label: (context: TooltipItem<'bubble'>) => {
            return `${(context.raw as GraphContextRaw).x} ms`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        suggestedMin: min,
        suggestedMax: max,
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
    elements: {
      point: {
        pointStyle: 'triangle',
      },
    },
  };

  const data = {
    datasets: [
      {
        label: name,
        data: graphData,
        backgroundColor:
          name.toLowerCase() === 'base'
            ? 'rgba(144, 89, 255, 0.6)'
            : 'rgba(0, 135, 135, 0.6)',
      },
    ],
  };

  return <Bubble options={options} data={data} />;
}

interface GraphDistributionProps {
  name: string;
  baseValues: number[];
  newValues: number[];
  min: number;
  max: number;
}

export default GraphDistribution;
