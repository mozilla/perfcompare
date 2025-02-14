import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  ScriptableContext,
} from 'chart.js';
import 'chart.js/auto';
import ZoomPlugin from 'chartjs-plugin-zoom';
import * as kde from 'fast-kde';
import { Line } from 'react-chartjs-2';

ChartJS.register(LinearScale, LineElement, ZoomPlugin);

function CommonGraph({
  baseValues,
  newValues,
  min,
  max,
  unit,
}: CommonGraphProps) {
  ///////////////// START SHOW VALUES ////////////////////////
  const baseValuesData = baseValues.map((v) => {
    return { x: v, y: 'Base' };
  });
  const newValuesData = newValues.map((v) => {
    return { x: v, y: 'New' };
  });

  const allValuesData = [...baseValuesData, ...newValuesData];

  //////////////////// START FAST KDE ////////////////////////
  // Arbitrary value that seems to work OK.
  // In the future we'll want to compute a better value, see
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1901248 for some ideas.
  const bandwidth = (max - min) / 15;
  const baseRunsDensity = Array.from(
    kde.density1d(baseValues, {
      bandwidth,
      extent: [min, max],
    }),
  );
  const newRunsDensity = Array.from(
    kde.density1d(newValues, {
      bandwidth,
      extent: [min, max],
    }),
  );
  //////////////////// END FAST KDE   ////////////////////////

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        align: 'start' as const,
        display: true,
        text: 'Runs Density Distribution',
      },
      zoom: {
        zoom: {
          mode: 'x',
          drag: {
            enabled: true,
            borderWidth: 1,
            backgroundColor: 'rgba(225,225,225,0.5)',
          },
          wheel: {
            enabled: true,
            speed: 0.2,
          },
          pinch: {
            enabled: true,
          },
        },
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl',
        },
        limits: {
          x: { min: 'original', max: 'original', minRange: bandwidth },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        suggestedMin: min,
        suggestedMax: max,
        grid: {
          display: false,
          offset: false,
        },
        title: {
          align: 'end' as const,
          display: true,
          text: `${unit} →`,
        },
      },
      yKde: {
        type: 'linear', // Linear scale
        stack: 'y', // yKde and yValues are part of the same stack
        stackWeight: 3, // Higher stack weight means it takes more space
        weight: 2, // Higher weight means it's on top in the stack
        beginAtZero: true,
        grace: '3%', // Make sure there's some more space at the top
        grid: {
          drawBorder: false,
          display: false,
          offset: false,
        },
        ticks: {
          beginAtZero: true,
          display: true,
        },
      },
      yValues: {
        type: 'category',
        stack: 'y',
        stackWeight: 1, // Lower stack weight means it takes less space
        weight: 1, // Lower weight means it's lower in the stack
        labels: ['Base', 'New'],
        offset: true, // This gives some space around the graph
        ticks: {
          autoSkip: false,
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
    interaction: {
      // Ideally we'd use this mode, but the tooltip then shows
      // duplicate items. It could be good to debug this in the future.
      //mode: 'x',
      // It shows the tooltips as soon as the mouse cursor is on the graph.
      intersect: false,
    },
  };

  const data = {
    datasets: [
      {
        yAxisID: 'yKde',
        label: 'Base',
        data: baseRunsDensity,
        fill: false,
        borderColor: 'rgba(144, 89, 255, 1)',
      },
      {
        yAxisID: 'yKde',
        label: 'New',
        data: newRunsDensity,
        fill: false,
        borderColor: 'rgba(0, 135, 135, 1)',
      },
      {
        yAxisID: 'yValues',
        type: 'bubble',
        pointStyle: 'triangle',
        pointRadius: 7,
        data: allValuesData,
        backgroundColor: (context: ScriptableContext<'bubble'>) =>
          (context.raw as { y: 'Base' | 'New' }).y === 'Base'
            ? 'rgba(144, 89, 255, 0.6)'
            : 'rgba(0, 135, 135, 0.6)',
      },
    ],
  };

  /* @ts-expect-error the types for chart.js do not seem great and do not support all options. */
  return <Line options={options} data={data} />;
}

interface CommonGraphProps {
  baseValues: number[];
  newValues: number[];
  min: number;
  max: number;
  unit: string | null;
}

export default CommonGraph;
