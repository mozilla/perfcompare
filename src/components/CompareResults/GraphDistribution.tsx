import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TooltipItem,
  ScriptableContext,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

interface GraphContextRaw {
  x: number;
  y: number;
  r: number;
}

function GraphDistribution(props: GraphDistributionProps) {
  const { baseValues, newValues, min, max, unit } = props;

  const baseData = baseValues.map((v) => {
    return { x: v, y: 'Base', r: 10 };
  });
  const newData = newValues.map((v) => {
    return { x: v, y: 'New', r: 10 };
  });

  const graphData = [...baseData, ...newData];

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bubble'>) => {
            return `${(context.raw as GraphContextRaw).x}${unit ? ' ' + unit : ''}`;
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
        type: 'category',
        labels: ['Base', 'New'],
        offset: true,
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
        backgroundColor: (context: ScriptableContext<'bubble'>) =>
          (context.raw as { y: 'Base' | 'New' }).y === 'Base'
            ? 'rgba(144, 89, 255, 0.6)'
            : 'rgba(0, 135, 135, 0.6)',
      },
    ],
  };

  /* @ts-expect-error the types for chart.js do not seem great and do not support all options. */
  return <Bubble options={options} data={data} />;
}

interface GraphDistributionProps {
  baseValues: number[];
  newValues: number[];
  min: number;
  max: number;
  unit: string | null;
}

export default GraphDistribution;
