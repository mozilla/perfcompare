import { useEffect, useMemo, useRef } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { init, type ECharts, type EChartsOption } from 'echarts';

import { Colors } from '../../styles/Colors';
import { fftkde } from '../../utils/kde.js';

// This computes the min, max from a list of numbers.
function computeStatisticsForRuns(data: number[]) {
  if (!data.length) {
    return null;
  }

  const sorted = [...data].sort((a, b) => a - b);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// A simple wrapper to Math.min, resilient when one of the numbers is undefined or null.
function computeMin(a?: number, b?: number) {
  a ??= Infinity;
  b ??= Infinity;
  return Math.min(a, b);
}

// A simple wrapper to Math.max, resilient when one of the numbers is undefined or null.
function computeMax(a?: number, b?: number) {
  a ??= -Infinity;
  b ??= -Infinity;
  return Math.max(a, b);
}

const CHART_HEIGHT = 300;
const KDE_GRID_POINTS = 1024;

// ISJ bandwidth selection can fail to converge on tiny or degenerate samples
// (few unique values, near-identical numbers). Fall back to Silverman's rule
// in that case — coarser, but it never fails.
function safeKde(values: number[]) {
  if (values.length < 2) return null;
  try {
    return fftkde(values, 'ISJ', undefined, KDE_GRID_POINTS);
  } catch {
    return fftkde(values, 'silverman', undefined, KDE_GRID_POINTS);
  }
}

// Linearly resample a uniform-grid KDE curve onto an arbitrary target x array.
// Outside the source range we return 0: each KDE's grid is padded so its
// density has already tapered to ≈0 at the edges.
function resampleOnto(
  srcX: ArrayLike<number>,
  srcY: ArrayLike<number>,
  targetX: number[],
): number[] {
  const n = srcX.length;
  const lo = srcX[0];
  const hi = srcX[n - 1];
  const step = (hi - lo) / (n - 1);
  const out = new Array<number>(targetX.length);
  for (let i = 0; i < targetX.length; i++) {
    const x = targetX[i];
    if (x < lo || x > hi) {
      out[i] = 0;
      continue;
    }
    // Clamp the lower index so x === hi lands on j = n-2 with frac = 1.
    const t = (x - lo) / step;
    const j = Math.min(Math.floor(t), n - 2);
    const frac = t - j;
    out[i] = srcY[j] * (1 - frac) + srcY[j + 1] * frac;
  }
  return out;
}

function CommonGraph({ baseValues, newValues, unit }: CommonGraphProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  const option: EChartsOption = useMemo(() => {
    const statsForBase = computeStatisticsForRuns(baseValues);
    const statsForNew = computeStatisticsForRuns(newValues);

    // Compute the global min and max with some grace value.
    const min = computeMin(statsForBase?.min, statsForNew?.min) * 0.95;
    const max = computeMax(statsForBase?.max, statsForNew?.max) * 1.05;

    // ISJ auto-selects the bandwidth per dataset, so each KDE tunes itself.
    const bKde = safeKde(baseValues);
    const nKde = safeKde(newValues);

    // Build a shared x-grid covering both KDEs' ranges. Resampling both
    // curves onto identical x positions is what lets the axis-trigger tooltip
    // pick up Base AND New at the cursor's x position,
    // instead of just one series or the other.
    const xStart = computeMin(bKde?.x[0], nKde?.x[0]);
    const xEnd = computeMax(
      bKde?.x[bKde.x.length - 1],
      nKde?.x[nKde.x.length - 1],
    );
    const sharedX: number[] = [];
    if (Number.isFinite(xStart) && Number.isFinite(xEnd) && xEnd > xStart) {
      for (let i = 0; i < KDE_GRID_POINTS; i++) {
        sharedX.push(xStart + ((xEnd - xStart) * i) / (KDE_GRID_POINTS - 1));
      }
    }

    const baseY = bKde ? resampleOnto(bKde.x, bKde.y, sharedX) : [];
    const newY = nKde ? resampleOnto(nKde.x, nKde.y, sharedX) : [];

    const baseRunsDensity: [number, number][] = bKde
      ? sharedX.map((xCoord, i) => [xCoord, baseY[i]])
      : [];
    const newRunsDensity: [number, number][] = nKde
      ? sharedX.map((xCoord, i) => [xCoord, newY[i]])
      : [];

    const unitSuffix = unit ? ` (${unit})` : '';

    return {
      animation: false,
      grid: { left: 70, right: 70, top: 28, height: 200 },
      xAxis: {
        type: 'value',
        min,
        max,
        name: unit ?? '',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#000',
        },
        // Tick labels show 2 dp for fractional values, drop ".00" for whole
        // numbers. Floats near integers (e.g. 14 + 1e-15) collapse to "14".
        axisLabel: {
          formatter: (value: number) => {
            const rounded = Math.round(value);
            if (Math.abs(value - rounded) < 1e-9) return String(rounded);
            return value.toFixed(2);
          },
        },
        splitLine: { show: true, lineStyle: { color: '#eee' } },
        axisLine: { show: true, lineStyle: { color: '#999' } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitLine: { show: true, lineStyle: { color: '#eee' } },
        axisLine: { show: true, lineStyle: { color: '#999' } },
        axisTick: { show: false },
        axisLabel: { show: true, color: '#000', fontSize: 12 },
      },
      // Wheel to zoom on the x-axis; shift+drag pans.
      // filterMode: 'none' keeps every data point in place — the zoom only
      // changes the visible window, so KDE curves still extend to the edges.
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none',
          zoomOnMouseWheel: true,
          moveOnMouseMove: 'shift',
          moveOnMouseWheel: false,
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'none',
          height: 16,
          bottom: 4,
          showDetail: false,
          brushSelect: false,
        },
      ],
      tooltip: {
        trigger: 'axis',
        // Vertical guide that snaps to data points, so the tooltip locks onto
        // a single x position with both series' densities side by side.
        axisPointer: { type: 'line', snap: true, lineStyle: { color: '#999' } },
        padding: 10,
        formatter: (params) => {
          const items = Array.isArray(params) ? params : [params];
          if (items.length === 0) return '';
          // axisValue is the snapped x position shared by all series; fall back
          // to the first item's x when it's absent (e.g. tooltip invoked
          // outside the axis-trigger path).
          const axisX =
            (items[0] as { axisValue?: number }).axisValue ??
            (items[0].value as [number, number])[0];
          const header = `Value: ${Number(axisX).toFixed(2)}${unitSuffix}`;
          const lines = items.map((pts) => {
            const marker = typeof pts.marker === 'string' ? pts.marker : '';
            const seriesName = pts.seriesName ?? '';
            const y = (pts.value as [number, number])[1];
            return `${marker}${seriesName}: ${y.toFixed(4)}`;
          });
          return [header, ...lines].join('<br>');
        },
      },
      toolbox: {
        feature: { restore: {}, saveAsImage: {} },
        right: 8,
        top: 4,
        itemSize: 12,
      },
      legend: {
        data: ['Base', 'New'],
        top: 4,
        left: 'center',
        itemHeight: 10,
        itemWidth: 30,
      },
      series: [
        {
          name: 'Base',
          type: 'line',
          triggerLineEvent: true,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: baseRunsDensity,
          showSymbol: false,
          lineStyle: { width: 3, color: Colors.ChartBase },
          itemStyle: { color: Colors.ChartBase },
          emphasis: { focus: 'none' },
        },
        {
          name: 'New',
          type: 'line',
          triggerLineEvent: true,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: newRunsDensity,
          showSymbol: false,
          lineStyle: { width: 3, color: Colors.ChartNew },
          itemStyle: { color: Colors.ChartNew },
          emphasis: { focus: 'none' },
        },
      ],
    };
  }, [baseValues, newValues, unit]);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    const instance = init(chartContainerRef.current);
    chartInstanceRef.current = instance;

    const handleResize = () => instance.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instance.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartInstanceRef.current?.setOption(option, true);
  }, [option]);

  return (
    <>
      <Typography id='retrigger-modal-title' component='h3' variant='h3'>
        Runs Density Distribution
      </Typography>
      <Box sx={{ flex: 0 }}>
        <div
          ref={chartContainerRef}
          style={{ width: '100%', height: CHART_HEIGHT }}
        />
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
