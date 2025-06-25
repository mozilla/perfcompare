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

  // The KDE line chart and categorical bubble chart share an x-axis but use
  // entirely different y-scales, making the composition flexible but
  // non-trivial.
  const options = {
    // Make the chart responsive to container size
    responsive: true,
    // Allow the chart to stretch freely, not keeping a fixed aspect ratio. This
    // needs the container's size to be well defined.
    maintainAspectRatio: false,
    plugins: {
      legend: {
        // Hide the default legend (labels for datasets)
        display: false,
      },

      tooltip: {
        // Allow tooltips to appear even when not directly intersecting a point
        intersect: false,
        callbacks: {
          // Suppress the tooltip title (normally shows the x-value)
          title: () => '',

          // Customize tooltip labels depending on the dataset type
          label(
            this: TooltipModel<'line'> | TooltipModel<'scatter'>,
            tooltipItem: TooltipItem<'line'> | TooltipItem<'scatter'>,
          ) {
            switch (tooltipItem.dataset.yAxisID) {
              case 'yKde': {
                // KDE line: show only the x-value with optional unit
                const x = tooltipItem.parsed.x.toFixed(2);
                return `@ ${x}` + (unit ? ` (${unit})` : '');
              }
              case 'yValues': {
                // For the bubble chart: display only one summary line, even if
                // multiple points overlap
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
                // Example: "Base: 42 (ms) (×3)"
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

          // Explicitly set the color of the square shown next to each tooltip label
          labelColor: (
            tooltipItem: TooltipItem<'line'> | TooltipItem<'scatter'>,
          ) => {
            const { dataset, raw } = tooltipItem;

            let source: 'Base' | 'New' | undefined;

            if (dataset.yAxisID === 'yKde') {
              // KDE lines distinguish between Base and New by label
              source = dataset.label === 'Base' ? 'Base' : 'New';
            } else if (dataset.yAxisID === 'yValues') {
              // Scatter chart: use the y-value ("Base" or "New") stored in the raw data
              source = (raw as { y: 'Base' | 'New' }).y;
            }

            if (source) {
              return {
                backgroundColor:
                  source === 'Base' ? Colors.ChartBase : Colors.ChartNew,
              };
            }

            // Fallback color if the dataset is not recognized
            return {
              backgroundColor: 'rgba(0,0,0,0)',
            };
          },
        },
        // Show color boxes (one per label, unless suppressed in labelColor)
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
          display: false, // Hide vertical grid lines
          offset: false,
        },
        title: {
          align: 'end' as const,
          display: true,
          text: `${unit} →`, // Example: "ms →"
        },
      },
      yKde: {
        type: 'linear', // Linear scale
        stack: 'y', // yKde and yValues are part of the same stack
        stackWeight: 3, // Larger stack weight means more vertical space
        weight: 3, // Larger weight ensures it's on top
        beginAtZero: true,
        grace: '3%', // Add margin at the top of the axis range
        grid: {
          drawBorder: false,
          display: false, // No horizontal grid lines for KDE
          offset: false,
        },
        ticks: {
          beginAtZero: true,
          display: true,
        },
      },

      // Spacer axis to visually separate KDE and scatter plots
      // This doesn't display anything.
      ySpacer: {
        type: 'linear',
        stack: 'y',
        stackWeight: 0.5, // Takes less space than yKde
        weight: 2, // Appears between yKde and yValues
        display: false, // Invisible axis (No ticks or grids)
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
        stackWeight: 1, // Smaller stack weight means it takes less space
        weight: 1, // Appears at the bottom
        labels: ['Base', 'New'],
        offset: true, // Adds extra padding for visual separation
        ticks: {
          autoSkip: false, // Show both labels even if close together
        },
      },
    },
    elements: {
      // These ones will be used for the 2 KDE datasets.
      // When needed, they will be overridden in the "scatter" dataset.
      line: {
        borderWidth: 3, // Thickness of KDE curves
      },
      point: {
        pointRadius: 0, // Points on line chart are invisible
        pointHoverRadius: 5, // But they respond to hover
      },
    },
    interaction: {
      // Show tooltip for the closest point (across all datasets)
      mode: 'nearest',
      // Only show tooltip if the mouse intersects the actual shape
      intersect: true,
    },
  };

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

  const data = {
    datasets: [
      {
        // First KDE line: density of the "Base" distribution
        yAxisID: 'yKde',
        label: 'Base',
        data: baseRunsDensity,
        fill: false,
        borderColor: Colors.ChartBase,
      },
      {
        // Second KDE line: density of the "New" distribution
        yAxisID: 'yKde',
        label: 'New',
        data: newRunsDensity,
        fill: false,
        borderColor: Colors.ChartNew,
      },
      {
        // Bubble chart layer: raw values from both distributions (shown as points)
        yAxisID: 'yValues',
        type: 'scatter',
        pointStyle: 'triangle',
        // Adjust point size based on dataset size (smaller points if there's a lot of data)
        pointRadius: allValuesData.length < 20 ? 7 : 5,
        data: allValuesData,
        // Color code points by category using dynamic function
        backgroundColor: (context: ScriptableContext<'scatter'>) =>
          ((context.raw as { y: 'Base' | 'New' }).y === 'Base'
            ? Colors.ChartBase
            : Colors.ChartNew) + '99', // Add 60% transparency to the hexadecimal color
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
