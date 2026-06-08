import { useEffect, useMemo, useRef } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { init, type ECharts, type EChartsOption } from 'echarts';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import {
  areaFracs,
  assignLetters,
  fftkde,
  fitModesFromKde,
} from '../../utils/kde.js';

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

const CHART_HEIGHT = 340;
const KDE_GRID_POINTS = 1024;
const KDE_GRID = { left: 70, right: 70, top: 28, height: 155 };
const SCATTER_GRID = { left: 70, right: 70, top: 250, height: 50 };

// Valley-depth threshold bounds for the mode-detection slider.
const VT_MIN = 0.1;
const VT_MAX = 0.99;
const VT_STEP = 0.01;

// Tick labels show 2 dp for fractional values, drop ".00" for whole numbers.
// Floats near integers (e.g. 14 + 1e-15) collapse to "14".
function tickFormatter(value: number): string {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 1e-9) return String(rounded);
  return value.toFixed(2);
}

// Per-series mode summary, suitable both for chart overlays and the blurb.
type ModeInfo = {
  peakLocs: number[];
  fracs: number[];
  letters: string[];
};

function computeModeInfo(x: number[], y: number[], vt: number): ModeInfo {
  if (!x.length || !y.length) {
    return { peakLocs: [], fracs: [], letters: [] };
  }
  const { peakLocs, boundaries } = fitModesFromKde(x, y, vt);
  if (!peakLocs.length) {
    return { peakLocs: [], fracs: [], letters: [] };
  }
  const fracs = areaFracs(x, y, boundaries);
  const letters = assignLetters(peakLocs);
  return { peakLocs, fracs, letters };
}

// Stagger levels (0, 1, 2 …) for peak labels: peaks closer than ~13% of the
// x-span get bumped to different levels so their labels don't overlap. Ported
// from kde-widget.js's allPeaks.level pass; we use a fixed 13% threshold
// because the chart's pixel width isn't known inside useMemo.
type PeakRef = {
  loc: number;
  seriesIdx: number;
  peakIdx: number;
  level: number;
};

function assignStaggerLevels(peaks: PeakRef[], xSpan: number): void {
  peaks.sort((a, b) => a.loc - b.loc);
  const threshold = xSpan * 0.13;
  for (let idx = 0; idx < peaks.length; idx++) {
    const used = new Set<number>();
    for (let k = 0; k < idx; k++) {
      if (Math.abs(peaks[k].loc - peaks[idx].loc) < threshold) {
        used.add(peaks[k].level);
      }
    }
    let level = 0;
    while (used.has(level)) level++;
    peaks[idx].level = level;
  }
}

function quantileSorted(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

// Silverman-Jones bandwidth approximation — produces a wider (smoother) kernel
// than ISJ, which works better for the small sample counts typical of top-level
// aggregated results.
function approximateSJBandwidth(sorted: number[]): number {
  const n = sorted.length;
  if (n < 2) return sorted[0] * 0.0015;
  const q25 = quantileSorted(sorted, 0.25);
  const q75 = quantileSorted(sorted, 0.75);
  const iqr = q75 - q25;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(
    sorted.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n,
  );
  const sigma = Math.min(std, iqr / 1.34);
  return 0.9 * sigma * Math.pow(n, -1 / 5);
}

// ISJ bandwidth selection can fail to converge on tiny or degenerate samples
// (few unique values, near-identical numbers). Fall back to Silverman's rule
// in that case — coarser, but it never fails.
// When bw is provided it is passed straight through to fftkde.
function safeKde(values: number[], bw?: number) {
  if (values.length < 2) return null;
  try {
    return fftkde(values, bw ?? 'ISJ', undefined, KDE_GRID_POINTS);
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

function CommonGraph({
  baseValues,
  newValues,
  unit,
  isSubtest,
  vt,
  onVtChange,
  showModes,
  onShowModesChange,
}: CommonGraphProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  // ECharts renders into its own DOM/canvas and reads its colors from the
  // option object — it doesn't inherit from MUI's ThemeProvider or CSS vars.
  // So we pull the current mode from the Redux theme slice and pass concrete
  // hex values into the chart option below.
  const themeMode = useAppSelector((state) => state.theme.mode);

  const option: EChartsOption = useMemo(() => {
    const textColor =
      themeMode === 'dark' ? Colors.PrimaryTextDark : Colors.PrimaryText;
    const statsForBase = computeStatisticsForRuns(baseValues);
    const statsForNew = computeStatisticsForRuns(newValues);

    // Compute the global min and max with some grace value.
    const min = computeMin(statsForBase?.min, statsForNew?.min) * 0.95;
    const max = computeMax(statsForBase?.max, statsForNew?.max) * 1.05;

    // Top-level results have fewer, more spread-out samples — use the SJ
    // approximation for a wider (smoother) bandwidth. Subtest results have
    // more data so ISJ can select a tighter, more accurate bandwidth.
    let baseBw: number | undefined;
    let newBw: number | undefined;
    if (!isSubtest) {
      const baseSorted = [...baseValues].sort((a, b) => a - b);
      const newSorted = [...newValues].sort((a, b) => a - b);
      baseBw =
        baseSorted.length >= 2 ? approximateSJBandwidth(baseSorted) : undefined;
      newBw =
        newSorted.length >= 2 ? approximateSJBandwidth(newSorted) : undefined;
    }

    const bKde = safeKde(baseValues, baseBw);
    const nKde = safeKde(newValues, newBw);

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

    const totalCount = baseValues.length + newValues.length;
    const symbolSize = totalCount < 20 ? 14 : 10;

    const JITTER = 0.6;
    // Base sits on the top row (y = 1), New on the bottom row (y = 0).
    const baseScatterData: [number, number][] = baseValues.map((v) => [
      v,
      1 + (Math.random() - 0.5) * JITTER,
    ]);
    const newScatterData: [number, number][] = newValues.map((v) => [
      v,
      (Math.random() - 0.5) * JITTER,
    ]);

    // Mode detection on the shared-grid curves so peak x-coords align across series.
    const baseModes = bKde
      ? computeModeInfo(sharedX, baseY, vt)
      : { peakLocs: [], fracs: [], letters: [] };
    const newModes = nKde
      ? computeModeInfo(sharedX, newY, vt)
      : { peakLocs: [], fracs: [], letters: [] };

    // Assign vertical stagger levels across all peaks so labels don't collide.
    const allPeaks: PeakRef[] = [];
    baseModes.peakLocs.forEach((loc, peakIdx) =>
      allPeaks.push({ loc, seriesIdx: 0, peakIdx, level: 0 }),
    );
    newModes.peakLocs.forEach((loc, peakIdx) =>
      allPeaks.push({ loc, seriesIdx: 1, peakIdx, level: 0 }),
    );
    const xSpan = max - min;
    if (xSpan > 0) assignStaggerLevels(allPeaks, xSpan);
    const levelLookup = new Map<string, number>();
    for (const p of allPeaks) {
      levelLookup.set(`${p.seriesIdx}-${p.peakIdx}`, p.level);
    }

    // Build the per-peak markLine overlays. Each is a dataless line series so
    // the markLine renders on its own. Names start with "_mode-" so the tooltip
    // and legend can filter them out.
    const modeOverlays: EChartsOption['series'] = [];
    function pushOverlays(
      seriesIdx: 0 | 1,
      seriesName: 'Base' | 'New',
      modes: ModeInfo,
      color: string,
    ) {
      modes.peakLocs.forEach((loc, peakIdx) => {
        const level = levelLookup.get(`${seriesIdx}-${peakIdx}`) ?? 0;
        (modeOverlays as unknown[]).push({
          name: `_mode-${seriesIdx}-${peakIdx}`,
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{ xAxis: loc }],
            lineStyle: { color, type: 'solid', width: 1.5 },
            label: {
              formatter:
                `${seriesName} ${modes.letters[peakIdx]}: ` +
                `${tickFormatter(loc)} (${Math.round(modes.fracs[peakIdx] * 100)}%)`,
              distance: [0, level * 16],
              color,
              fontSize: 12,
            },
          },
        });
      });
    }
    if (showModes) {
      pushOverlays(0, 'Base', baseModes, Colors.ChartBase);
      pushOverlays(1, 'New', newModes, Colors.ChartNew);
    }

    return {
      animation: false,
      grid: [KDE_GRID, SCATTER_GRID],
      // axisPointer link keeps the vertical crosshair in sync across both grids.
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      xAxis: [
        {
          gridIndex: 0,
          type: 'value',
          min,
          max,
          name: unit ?? '',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 13, fontWeight: 'bold', color: textColor },
          // Tick labels show 2 dp for fractional values, drop ".00" for whole
          // numbers. Floats near integers (e.g. 14 + 1e-15) collapse to "14".
          axisLabel: { formatter: tickFormatter, color: textColor },
          splitLine: { show: true, lineStyle: { color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#999' } },
        },
        {
          gridIndex: 1,
          type: 'value',
          min,
          max,
          axisLabel: { show: false },
          splitLine: { show: false },
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisTick: { show: false },
        },
      ],
      yAxis: [
        {
          gridIndex: 0,
          type: 'value',
          min: 0,
          splitLine: { show: true, lineStyle: { color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisTick: { show: false },
          axisLabel: { show: true, color: textColor, fontSize: 12 },
        },
        {
          gridIndex: 1,
          type: 'value',
          min: -0.5,
          max: 1.5,
          interval: 1,
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { color: '#999' } },
          axisLabel: {
            color: textColor,
            fontSize: 12,
            formatter: (v: number) => (v === 1 ? 'Base' : v === 0 ? 'New' : ''),
          },
          splitLine: { show: false },
        },
      ],
      // Wheel to zoom on the x-axis; shift+drag pans.
      // filterMode: 'none' keeps every data point in place — the zoom only
      // changes the visible window, so KDE curves still extend to the edges.
      // xAxisIndex: [0, 1] keeps both grids in sync.
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
        axisPointer: { type: 'line', snap: true, lineStyle: { color: '#999' } },
        padding: 10,
        formatter: (params) => {
          const items = Array.isArray(params) ? params : [params];
          if (items.length === 0) return '';
          // Scatter tooltip: show raw run values
          if ((items[0] as { seriesType?: string }).seriesType === 'scatter') {
            return items
              .map((pts) => {
                const marker = typeof pts.marker === 'string' ? pts.marker : '';
                const xVal = (pts.value as [number, number])[0];
                return `${marker}${pts.seriesName ?? ''}: ${xVal.toFixed(2)}${unitSuffix}`;
              })
              .join('<br>');
          }
          // KDE tooltip: show density at the cursor x
          const axisX =
            (items[0] as { axisValue?: number }).axisValue ??
            (items[0].value as [number, number])[0];
          const header = `Value: ${Number(axisX).toFixed(2)}${unitSuffix}`;
          const lines = items.map((pts) => {
            const marker = typeof pts.marker === 'string' ? pts.marker : '';
            const y = (pts.value as [number, number])[1];
            return `${marker}${pts.seriesName ?? ''}: ${y.toFixed(4)}`;
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
        // Sit below the centered x-axis unit label, between the KDE grid and
        // the scatter strip, with a small gap above and below.
        top: 232,
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
          data: baseScatterData,
          symbol: 'triangle',
          symbolSize,
          itemStyle: { color: Colors.ChartBase, opacity: 0.6 },
          emphasis: { focus: 'none' },
          // Horizontal baseline through the Base row (y = 1) for a visual anchor.
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              position: 'end',
              formatter: 'Base',
              color: Colors.ChartBase,
              fontSize: 12,
            },
            data: [{ yAxis: 1 }],
            lineStyle: {
              color: Colors.ChartBase,
              type: 'solid',
              width: 1,
              opacity: 0.5,
            },
          },
        },
        {
          name: 'New',
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: newScatterData,
          symbol: 'triangle',
          symbolSize,
          itemStyle: { color: Colors.ChartNew, opacity: 0.6 },
          emphasis: { focus: 'none' },
          // Horizontal baseline through the New row (y = 0) for a visual anchor.
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              position: 'end',
              formatter: 'New',
              color: Colors.ChartNew,
              fontSize: 12,
            },
            data: [{ yAxis: 0 }],
            lineStyle: {
              color: Colors.ChartNew,
              type: 'solid',
              width: 1,
              opacity: 0.5,
            },
          },
        },
        ...((modeOverlays ?? []) as []),
      ],
    };
  }, [baseValues, newValues, unit, isSubtest, vt, themeMode, showModes]);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mt: 1,
          mb: 0.5,
        }}
      >
        <Typography
          variant='body2'
          sx={{
            color: '#000',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Valley depth threshold
          <Tooltip
            placement='top'
            title='A valley between two peaks must be shallower than this fraction of the shorter peak to count as a mode boundary. Higher = more splits detected.'
          >
            <InfoIcon
              fontSize='small'
              sx={{ color: '#000', cursor: 'help', mx: 0.5 }}
            />
          </Tooltip>
          :
        </Typography>
        <Slider
          size='small'
          value={vt}
          min={VT_MIN}
          max={VT_MAX}
          step={VT_STEP}
          disabled={!showModes}
          onChange={(_, value) => onVtChange(value)}
          aria-label='Valley depth threshold'
          sx={{ maxWidth: 240 }}
        />
        <Typography
          variant='body2'
          sx={{ color: '#555', minWidth: 36, textAlign: 'right' }}
        >
          {Math.round(vt * 100)}%
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              checked={showModes}
              onChange={(_, checked) => onShowModesChange(checked)}
            />
          }
          label='Show modes'
          sx={{ ml: 1, '& .MuiFormControlLabel-label': { fontSize: 14 } }}
        />
      </Box>
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
  isSubtest: boolean;
  vt: number;
  onVtChange: (value: number) => void;
  showModes: boolean;
  onShowModesChange: (value: boolean) => void;
}

export default CommonGraph;
