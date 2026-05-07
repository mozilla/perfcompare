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
    const bKde =
      baseValues.length >= 2
        ? fftkde(baseValues, 'ISJ', undefined, 1024)
        : null;
    const nKde =
      newValues.length >= 2 ? fftkde(newValues, 'ISJ', undefined, 1024) : null;
    const baseRunsDensity: [number, number][] = bKde
      ? bKde.x.map((xCoord, index) => [xCoord, bKde.y[index]])
      : [];
    const newRunsDensity: [number, number][] = nKde
      ? nKde.x.map((xCoord, index) => [xCoord, nKde.y[index]])
      : [];

    // Raw values rendered as a categorical scatter ("Base" / "New").
    const baseScatter: [number, string][] = baseValues.map((value) => [
      value,
      'Base',
    ]);
    const newScatter: [number, string][] = newValues.map((value) => [
      value,
      'New',
    ]);

    const totalScatter = baseValues.length + newValues.length;
    const symbolSize = totalScatter < 20 ? 14 : 10;

    // Pre-compute counts of identical (category, value) pairs so the tooltip
    // can show "(×N)" when several runs share the same value.
    const counts = new Map<string, number>();
    for (const value of baseValues) {
      const key = `Base|${value}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const value of newValues) {
      const key = `New|${value}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const unitSuffix = unit ? ` (${unit})` : '';

    return {
      animation: false,
      // Two stacked grids: the top one holds the KDE curves, the bottom one
      // the categorical scatter. Both share horizontal extent and x-range.
      // The top is bumped down to leave room for the legend above.
      grid: [
        { left: 70, right: 70, top: 28, height: 140 },
        { left: 70, right: 70, top: 200, height: 50 },
      ],
      xAxis: [
        {
          type: 'value',
          gridIndex: 0,
          min,
          max,
          splitLine: { show: false },
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisTick: { show: false },
          axisLabel: { show: false },
        },
        {
          type: 'value',
          gridIndex: 1,
          min,
          max,
          name: `${unit ?? ''} →`,
          nameLocation: 'end',
          nameGap: 8,
          nameTextStyle: {
            align: 'left',
            verticalAlign: 'middle',
            fontSize: 12,
          },
          splitLine: { show: true, lineStyle: { color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#999' } },
        },
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          min: 0,
          splitLine: { show: true, lineStyle: { color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisTick: { show: false },
          axisLabel: { show: true, color: '#000', fontSize: 12 },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: ['Base', 'New'],
          boundaryGap: true,
          position: 'left',
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisTick: { show: false },
          axisLabel: {
            show: true,
            interval: 0,
            margin: 8,
            color: '#000',
            fontSize: 12,
          },
        },
      ],
      // Wheel to zoom on the x-axis; shift+drag pans. Both grids share the
      // x-range, so the zoom applies to xAxisIndex [0, 1] in tandem.
      // filterMode: 'none' keeps every data point in place — the zoom only
      // changes the visible window, so KDE curves still extend to the edges.
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          filterMode: 'none',
          zoomOnMouseWheel: true,
          moveOnMouseMove: 'shift',
          moveOnMouseWheel: false,
        },
        {
          type: 'slider',
          xAxisIndex: [0, 1],
          filterMode: 'none',
          height: 16,
          bottom: 4,
          showDetail: false,
          brushSelect: false,
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
        padding: 10,
        formatter: (params) => {
          // With trigger: 'axis', echarts passes an array of points (one per
          // series at the cursor's x). For trigger: 'item' it'd be a single
          // object; normalise to an array either way.
          const items = Array.isArray(params) ? params : [params];
          const lines = items
            .map((pts) => {
              const marker = typeof pts.marker === 'string' ? pts.marker : '';
              const seriesName = pts.seriesName ?? '';
              if (pts.seriesType === 'line') {
                const xValue = (pts.value as [number, number])[0];
                return `${marker}${seriesName} @ ${xValue.toFixed(2)}${unitSuffix}`;
              }
              if (pts.seriesType === 'scatter') {
                const [xValue, category] = pts.value as [number, string];
                const count = counts.get(`${category}|${xValue}`) ?? 1;
                const summary = count > 1 ? ` (×${count})` : '';
                return `${marker}${seriesName}: ${xValue}${unitSuffix}${summary}`;
              }
              return '';
            })
            .filter((line) => line);
          return lines.join('<br>');
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
        {
          name: 'Base',
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: baseScatter,
          symbol: 'triangle',
          symbolSize,
          itemStyle: { color: Colors.ChartBase + '99' },
        },
        {
          name: 'New',
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: newScatter,
          symbol: 'triangle',
          symbolSize,
          itemStyle: { color: Colors.ChartNew + '99' },
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
