import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  ScriptableContext,
  type TooltipItem,
  type TooltipModel,
} from 'chart.js';
import 'chart.js/auto';
import * as kde from 'fast-kde';
import { Line } from 'react-chartjs-2';

import { Colors } from '../../styles/Colors';

ChartJS.register(LinearScale, LineElement);

function computeMinMax(
  baseRuns: number[],
  newRuns: number[],
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const value of baseRuns) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  for (const value of newRuns) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  // Add some grace value of 5%
  min = min * 0.95;
  max = max * 1.05;
  return [min, max];
}

function CommonGraph({ baseValues, newValues, unit }: CommonGraphProps) {
  const [min, max] = computeMinMax(baseValues, newValues);

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
      tooltip: {
        intersect: false,
        callbacks: {
          // Never display any title
          title: () => '',

          // Display a specialized label for each chart
          label(
            this: TooltipModel<'line'> | TooltipModel<'scatter'>,
            tooltipItem: TooltipItem<'line'> | TooltipItem<'scatter'>,
          ) {
            switch (tooltipItem.dataset.yAxisID) {
              case 'yKde': {
                const x = tooltipItem.parsed.x.toFixed(2);
                return `@ ${x}` + (unit ? ` (${unit})` : '');
              }
              case 'yValues': {
                // In case there are several data points for this tooltip,
                // display only one summary line.
                if (
                  this.dataPoints.length > 1 &&
                  this.dataPoints[0] !== tooltipItem
                ) {
                  return '';
                }

                const point = tooltipItem.raw as {
                  x: number;
                  y: 'Base' | 'New';
                };
                const labelString = `${point.y}: ${point.x}`;
                const unitString = unit ? ` (${unit})` : '';
                const summaryString =
                  this.dataPoints.length > 1
                    ? ` (×${this.dataPoints.length})`
                    : '';
                return labelString + unitString + summaryString;
              }
              default:
                return '';
            }
          },

          // Explicitely define the color of the label's box
          labelColor: (
            tooltipItem: TooltipItem<'line'> | TooltipItem<'scatter'>,
          ) => {
            const { dataset, raw } = tooltipItem;

            let source: 'Base' | 'New' | undefined;

            if (dataset.yAxisID === 'yKde') {
              source = dataset.label === 'Base' ? 'Base' : 'New';
            } else if (dataset.yAxisID === 'yValues') {
              source = (raw as { y: 'Base' | 'New' }).y;
            }

            if (source) {
              return {
                backgroundColor:
                  source === 'Base' ? Colors.ChartBase : Colors.ChartNew,
              };
            }

            // Fallback in case we missed a case
            return {
              backgroundColor: 'rgba(0,0,0,0)',
            };
          },
        },
        displayColors: true,
        padding: 10,
        boxPadding: 4,
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
        weight: 3, // Higher weight means it's on top in the stack
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
      // This scale only controls the space between the kde and the scatter
      // chart below. Without this they end up too close with each other.
      ySpacer: {
        type: 'linear',
        stack: 'y',
        stackWeight: 0.5, // Adjust for more or less space
        weight: 2,
        display: false, // Invisible axis
        grid: {
          display: false,
        },
        ticks: {
          display: false,
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
      // These ones will be used for the 2 KDE datasets
      line: {
        borderWidth: 3,
      },
      point: {
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
  };

  const data = {
    datasets: [
      {
        yAxisID: 'yKde',
        label: 'Base',
        data: baseRunsDensity,
        fill: false,
        borderColor: Colors.ChartBase,
      },
      {
        yAxisID: 'yKde',
        label: 'New',
        data: newRunsDensity,
        fill: false,
        borderColor: Colors.ChartNew,
      },
      {
        yAxisID: 'yValues',
        type: 'scatter',
        pointStyle: 'triangle',
        pointRadius: allValuesData.length < 20 ? 7 : 5,
        data: allValuesData,
        backgroundColor: (context: ScriptableContext<'scatter'>) =>
          ((context.raw as { y: 'Base' | 'New' }).y === 'Base'
            ? Colors.ChartBase
            : Colors.ChartNew) + '99', // Add 60% transparency
      },
    ],
  };

  return (
    <>
      <Typography id='retrigger-modal-title' component='h3' variant='h3'>
        Runs Density Distribution
      </Typography>
      <Box sx={{ flex: 0 }}>
        {/* @ts-expect-error the types for chart.js do not seem great and do not support all options. */}
        <Line height={300} options={options} data={data} />
      </Box>
    </>
  );
}

interface CommonGraphProps {
  baseValues: number[];
  newValues: number[];
  unit: string | null;
}

export default CommonGraph;
