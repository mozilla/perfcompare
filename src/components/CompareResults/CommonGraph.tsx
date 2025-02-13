import { Chart as ChartJS, LineElement, LinearScale } from 'chart.js';
import 'chart.js/auto';
import ZoomPlugin from 'chartjs-plugin-zoom';
import * as kde from 'fast-kde';
import { Line } from 'react-chartjs-2';

import { MeasurementUnit } from '../../types/types';

ChartJS.register(LinearScale, LineElement, ZoomPlugin);

function CommonGraph({
  baseRevisionRuns,
  newRevisionRuns,
  min,
  max,
}: CommonGraphProps) {
  const scaleUnit =
    baseRevisionRuns.measurementUnit || newRevisionRuns.measurementUnit;

  //////////////////// START FAST KDE ////////////////////////
  // Arbitrary value that seems to work OK.
  // In the future we'll want to compute a better value, see
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1901248 for some ideas.
  if (max === min) {
    min = max - 15;
    max = max + 15;
  }
  const bandwidth = (max - min) / 15;
  const baseRunsDensity = Array.from(
    kde.density1d(baseRevisionRuns.values, {
      bandwidth,
      extent: [min - bandwidth, max + bandwidth],
    }),
  );
  const newRunsDensity = Array.from(
    kde.density1d(newRevisionRuns.values, {
      bandwidth,
      extent: [min - bandwidth, max + bandwidth],
    }),
  );
  //////////////////// END FAST KDE   ////////////////////////

  const options = {
    plugins: {
      legend: {
        //        align: 'start' as const,
        position: 'bottom' as const,
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
    responsive: true,
    maintainAspectRatio: false,
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
          text: scaleUnit || '',
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

  /* @ts-expect-error the types for chart.js do not seem great and do not support all options. */
  return <Line options={options} data={data} />;
}

interface CommonGraphProps {
  baseRevisionRuns: {
    name: string;
    median: number;
    values: number[];
    stddev: number;
    stddevPercent: number;
    measurementUnit: MeasurementUnit;
  };
  newRevisionRuns: {
    name: string;
    median: number;
    values: number[];
    stddev: number;
    stddevPercent: number;
    measurementUnit: MeasurementUnit;
  };
  min: number;
  max: number;
}

export default CommonGraph;
