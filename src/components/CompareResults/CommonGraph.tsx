import { useEffect, useMemo, useRef, useState } from 'react';

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
import { getDisplayScale } from '../../utils/format';
import {
  bandwidthFor,
  computeModeInfo,
  KDE_GRID_POINTS,
  safeKde,
  type ModeInfo,
} from '../../utils/kdeAnalysis';

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

// Show the smoothing slider when the bandwidth exceeds half the data range —
// at that point the KDE curve is genuinely flat and the user may want to dial
// it down to see structure.
const LARGE_BW_RATIO = 0.5;
const LABEL_ROW_PX = 16; // vertical space per stagger level
const KDE_TOP_BASE = 28;
const KDE_HEIGHT = 155;
const SCATTER_TOP_BASE = 250;
const SCATTER_HEIGHT = 50;
const CHART_HEIGHT_BASE = 340;

// Valley-depth threshold bounds for the mode-detection slider.
const VT_MIN = 0.1;
const VT_MAX = 0.99;
const VT_STEP = 0.01;

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
  const threshold = xSpan * 0.2;
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

  const rawBandwidths = useMemo(
    () => ({
      base: bandwidthFor(baseValues, isSubtest),
      new: bandwidthFor(newValues, isSubtest),
    }),
    [baseValues, newValues, isSubtest],
  );

  const isLargeBw = useMemo(() => {
    const allValues = [...baseValues, ...newValues];
    if (allValues.length < 2) return false;
    const lo = Math.min(...allValues);
    const hi = Math.max(...allValues);
    const range = hi - lo;
    if (range === 0) return false;
    const bw = Math.max(rawBandwidths?.base ?? 0, rawBandwidths?.new ?? 0);
    return bw / range > LARGE_BW_RATIO;
  }, [baseValues, newValues, rawBandwidths]);

  const [bwMultiplier, setBwMultiplier] = useState(1.0);
  useEffect(() => setBwMultiplier(1.0), [baseValues, newValues]);

  // Local mirror of vt that drives the slider thumb + percentage during drag.
  // We only push the value up to the parent (via onVtChange) when the user
  // releases the slider — keeping mode detection from re-running on every
  // pixel of slider movement. Synced back to the prop so external resets
  // still work.
  const [localVt, setLocalVt] = useState(vt);
  useEffect(() => {
    setLocalVt(vt);
  }, [vt]);

  // Vt-independent precompute: KDE, shared-grid resample, scatter jitter, and
  // axis bounds. Pulled out of the main option memo so dragging the valley-
  // depth slider doesn't (a) re-run the expensive fftkde call and (b) reroll
  // Math.random() jitter — which made the scatter dots visibly jump while
  // tuning the threshold.
  const analysis = useMemo(() => {
    const statsForBase = computeStatisticsForRuns(baseValues);
    const statsForNew = computeStatisticsForRuns(newValues);

    const sharedBw = rawBandwidths
      ? Math.max(rawBandwidths.base ?? 0, rawBandwidths.new ?? 0) * bwMultiplier
      : undefined;

    const bKde = safeKde(baseValues, sharedBw);
    const nKde = safeKde(newValues, sharedBw);

    // Build a shared x-grid covering both KDEs' ranges. Resampling both
    // curves onto identical x positions is what lets the axis-trigger tooltip
    // pick up Base AND New at the cursor's x position,
    // instead of just one series or the other.
    const xStart = computeMin(bKde?.x[0], nKde?.x[0]);
    const xEnd = computeMax(
      bKde?.x[bKde.x.length - 1],
      nKde?.x[nKde.x.length - 1],
    );

    // Use the KDE grid extent as axis bounds — it is already padded by
    // gaussianPracticalSupport(bandwidth) inside autogrid1D, so it scales
    // correctly regardless of the absolute magnitude of the values.
    // Fall back to additive range-based padding when no KDE is available.
    let min: number;
    let max: number;
    if (Number.isFinite(xStart) && Number.isFinite(xEnd)) {
      const pad = (xEnd - xStart) * 0.05;
      min = xStart - pad;
      max = xEnd + pad;
    } else {
      const dataMin = computeMin(statsForBase?.min, statsForNew?.min) ?? 0;
      const dataMax = computeMax(statsForBase?.max, statsForNew?.max) ?? 0;
      const pad = (dataMax - dataMin) * 0.05;
      min = dataMin - pad;
      max = dataMax + pad;
    }
    // When data is near-constant the axis range can be absurdly narrow.
    // Enforce a minimum range of 1% of the midpoint value so ticks are readable.
    const mid = (min + max) / 2;
    const minRange = Math.abs(mid) * 0.01;
    if (max - min < minRange) {
      min = mid - minRange / 2;
      max = mid + minRange / 2;
    }
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

    return {
      bKde,
      nKde,
      sharedX,
      baseY,
      newY,
      baseRunsDensity,
      newRunsDensity,
      baseScatterData,
      newScatterData,
      min,
      max,
    };
  }, [baseValues, newValues, isSubtest, rawBandwidths, bwMultiplier]);

  // Mode detection (peaks, area fractions, label assignment, stagger levels)
  // lives in its own memo so it only re-runs when the threshold or the
  // underlying curves change — not on theme switch, scatter strip toggle, or
  // unit changes. Uses localVt (the live slider position) so mode lines track
  // the thumb in real time. fitModesFromKde is cheap (array ops on a
  // pre-computed 1024-point grid), so running it on every drag pixel is fine.
  const modes = useMemo(() => {
    const { bKde, nKde, sharedX, baseY, newY, min, max } = analysis;

    const baseModes: ModeInfo = bKde
      ? computeModeInfo(sharedX, baseY, localVt)
      : { peakLocs: [], boundaries: [], fracs: [], letters: [] };
    const newModes: ModeInfo = nKde
      ? computeModeInfo(sharedX, newY, localVt)
      : { peakLocs: [], boundaries: [], fracs: [], letters: [] };

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

    const maxLevel =
      levelLookup.size > 0 ? Math.max(...levelLookup.values()) : 0;
    return { baseModes, newModes, levelLookup, maxLevel };
  }, [analysis, localVt]);

  const option: EChartsOption = useMemo(() => {
    const textColor =
      themeMode === 'dark' ? Colors.PrimaryTextDark : Colors.PrimaryText;
    const {
      baseRunsDensity,
      newRunsDensity,
      baseScatterData,
      newScatterData,
      min,
      max,
    } = analysis;
    const { baseModes, newModes, levelLookup, maxLevel } = modes;
    const extraTop = maxLevel * LABEL_ROW_PX;
    const kdeGrid = {
      left: 70,
      right: 70,
      top: KDE_TOP_BASE + extraTop,
      height: KDE_HEIGHT,
    };
    const scatterGrid = {
      left: 70,
      right: 70,
      top: SCATTER_TOP_BASE + extraTop,
      height: SCATTER_HEIGHT,
    };

    const { scale, displayUnit, decimals } = unit
      ? getDisplayScale([min, max], unit)
      : { scale: 1, displayUnit: unit ?? '', decimals: 2 };
    const unitSuffix = displayUnit ? ` (${displayUnit})` : '';
    const totalCount = baseValues.length + newValues.length;
    const symbolSize = totalCount < 20 ? 14 : 10;
    const tickFormatter = (value: number) => (value / scale).toFixed(decimals);

    // Build the per-peak markLine overlays. Each is a dataless line series
    // whose markLine renders on its own. They share names with their parent
    // series ('Base' / 'New') so the legend's toggle action cascades to the
    // overlays automatically — clicking 'Base' hides every series named
    // 'Base', including the overlays. The legend itself only renders the two
    // entries listed in `legend.data` regardless of how many series share
    // those names.
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
          name: seriesName,
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
      grid: [kdeGrid, scatterGrid],
      // axisPointer link keeps the vertical crosshair in sync across both grids.
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      xAxis: [
        {
          gridIndex: 0,
          type: 'value',
          min,
          max,
          name: displayUnit,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 13, fontWeight: 'bold', color: textColor },
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
                return `${marker}${pts.seriesName ?? ''}: ${(xVal / scale).toFixed(decimals)}${unitSuffix}`;
              })
              .join('<br>');
          }
          // KDE tooltip: show density at the cursor x
          const axisX =
            (items[0] as { axisValue?: number }).axisValue ??
            (items[0].value as [number, number])[0];
          const header = `Value: ${(Number(axisX) / scale).toFixed(decimals)}${unitSuffix}`;
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
  }, [analysis, modes, baseValues, newValues, unit, themeMode, showModes]);

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
        {/*
          MUI Slider exposes two events: `onChange` fires continuously during
          drag (we send it to local state for a smooth thumb), and
          `onChangeCommitted` fires once when the user releases (we push the
          final value up to the parent then). This is the moral equivalent of
          a debounce — the expensive consumer (`computeModeInfo`) runs once
          per drag instead of on every pixel of movement.
        */}
        <Slider
          size='small'
          value={localVt}
          min={VT_MIN}
          max={VT_MAX}
          step={VT_STEP}
          disabled={!showModes}
          onChange={(_, value) => setLocalVt(value)}
          onChangeCommitted={(_, value) => onVtChange(value)}
          aria-label='Valley depth threshold'
          sx={{ maxWidth: 240 }}
        />
        <Typography
          variant='body2'
          sx={{ color: '#555', minWidth: 36, textAlign: 'right' }}
        >
          {Math.round(localVt * 100)}%
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
          style={{
            width: '100%',
            height: CHART_HEIGHT_BASE + modes.maxLevel * LABEL_ROW_PX,
          }}
        />
      </Box>
      {isLargeBw && (
        <Box sx={{ px: 2, pt: 0.5 }}>
          <Typography variant='caption' color='text.secondary'>
            High variance detected — smoothing ({bwMultiplier.toFixed(2)}×)
          </Typography>
          <Slider
            size='small'
            min={0.05}
            max={1.5}
            step={0.05}
            value={bwMultiplier}
            onChange={(_, v) => setBwMultiplier(v)}
            valueLabelDisplay='auto'
            valueLabelFormat={(v) => `${v.toFixed(2)}×`}
          />
        </Box>
      )}
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
