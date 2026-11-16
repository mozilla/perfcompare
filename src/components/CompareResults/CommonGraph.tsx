import { useEffect, useMemo, useRef, useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  init,
  type ECharts,
  type EChartsOption,
  type LineSeriesOption,
} from 'echarts';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { getDisplayScale } from '../../utils/format';
import { matchModeLetters } from '../../utils/kde.js';
import {
  computeModeInfo,
  EMPTY_MODE_INFO,
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

const KDE_TOP_BASE = 44;
const KDE_HEIGHT = 230;
const SCATTER_TOP_BASE = 364;
const SCATTER_HEIGHT = 50;
const CHART_HEIGHT_BASE = 464;
const AXIS_LINE_COLOR = '#999';
const SPLIT_LINE_COLOR = '#eee';

// Matched modes share a color. Base uses solid spans; New uses dashed spans.
// Labels use dark colors on a pale background for readability in either theme.
const MODE_FILL_COLORS = [
  '#0D47A1', // A – blue
  '#7A4009', // B – amber
  '#0F4D29', // C – green
  '#8B2318', // D – red
  '#5A2D77', // E – purple
];

// Mode-sensitivity slider bounds.
const VT_MIN = 0.1;
const VT_MAX = 0.99;
const VT_STEP = 0.01;

// Measure a label's rendered width in pixels so it can be shifted left by
// exactly that amount, keeping its right edge (rather than its left edge)
// anchored to the peak — this is what prevents right-edge clipping near the
// chart boundary.
let measureCanvas: HTMLCanvasElement | null = null;
function measureTextWidth(
  text: string,
  fontSize: number,
  fontWeight: string,
): number {
  measureCanvas ??= document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
  return ctx.measureText(text).width;
}

// Scale a hex color's channels toward black. Used to give the New label a
// visibly distinct (and only-higher-contrast) text color from Base's, rather
// than relying on font-weight alone to tell them apart.
function darkenHex(hex: string, factor: number): string {
  const num = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(((num >> shift) & 0xff) * factor)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(16)}${channel(8)}${channel(0)}`;
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
  lowerIsBetter = true,
  sharedBw,
  bwMultiplier,
  onBwMultiplierChange,
  isLargeBw,
  vt,
  onVtChange,
  showModes,
  onShowModesChange,
  infoTooltip,
}: CommonGraphProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  // ECharts renders into its own DOM/canvas and reads its colors from the
  // option object — it doesn't inherit from MUI's ThemeProvider or CSS vars.
  const themeMode = useAppSelector((state) => state.theme.mode);
  const textColor =
    themeMode === 'dark' ? Colors.PrimaryTextDark : Colors.PrimaryText;

  // Local mirror of vt that drives the slider thumb + percentage during drag.
  // Mode overlays update live; the detail panel receives the final value via
  // onVtChange on release. Sync back to the prop for external resets.
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
      sharedBw,
    };
  }, [baseValues, newValues, sharedBw]);

  // Mode detection (KDE peak detection and label assignment)
  // lives in its own memo so it only re-runs when the sensitivity slider or the
  // underlying samples change — not on theme switch, scatter strip toggle, or
  // unit changes. Uses localVt (the live slider position) so mode lines track
  // the thumb in real time.
  const modes = useMemo(() => {
    const { bKde, nKde } = analysis;
    const baseRaw = bKde
      ? computeModeInfo(bKde.x, bKde.y, localVt, baseValues)
      : EMPTY_MODE_INFO;
    const newRaw = nKde
      ? computeModeInfo(nKde.x, nKde.y, localVt, newValues)
      : EMPTY_MODE_INFO;

    const { baseLetters, newLetters } = matchModeLetters(
      baseRaw.peakLocs,
      baseRaw.fracs,
      newRaw.peakLocs,
      newRaw.fracs,
    );
    const baseModes = { ...baseRaw, letters: baseLetters };
    const newModes = { ...newRaw, letters: newLetters };

    return { baseModes, newModes };
  }, [analysis, localVt, baseValues, newValues]);

  const option: EChartsOption = useMemo(() => {
    const {
      baseRunsDensity,
      newRunsDensity,
      baseScatterData,
      newScatterData,
      min,
      max,
      sharedBw,
    } = analysis;
    const { baseModes, newModes } = modes;
    const kdeGrid = {
      left: 70,
      right: 70,
      top: KDE_TOP_BASE,
      height: KDE_HEIGHT,
    };
    const scatterGrid = {
      left: 70,
      right: 70,
      top: SCATTER_TOP_BASE,
      height: SCATTER_HEIGHT,
    };

    const { scale, displayUnit, decimals } = unit
      ? getDisplayScale([min, max], unit)
      : { scale: 1, displayUnit: unit ?? '', decimals: 2 };
    const unitSuffix = displayUnit ? ` (${displayUnit})` : '';
    const totalCount = baseValues.length + newValues.length;
    const symbolSize = totalCount < 20 ? 14 : 10;
    const tickFormatter = (value: number) => (value / scale).toFixed(decimals);
    // Scale density y-values to match the display unit. KDE densities are
    // computed in raw-unit space (e.g. per uWh); when the x-axis is shown in a
    // larger unit (e.g. mWh, scale=1000), the probability density must be
    // multiplied by scale so ∫f(x)dx = 1 still holds visually.
    const scaleDensity = ([x, y]: [number, number]): [number, number] => [
      x,
      y * scale,
    ];
    const scaledBaseRunsDensity = baseRunsDensity.map(scaleDensity);
    const scaledNewRunsDensity = newRunsDensity.map(scaleDensity);

    // Build mode overlays: one horizontal span line per mode per series.
    //
    // Each span runs from the mode's left boundary to its right boundary,
    // above the density curve. Base = thick solid, New = thinner dashed. Same
    // color = same mode letter (matched across Base/New). A thin vertical tick
    // marks the exact peak position; the label on the span carries the detail.
    const maxDensity = Math.max(
      ...scaledBaseRunsDensity.map(([, y]) => y),
      ...scaledNewRunsDensity.map(([, y]) => y),
      0.001,
    );
    // Highest letter index across both series determines the topmost span row.
    // We need to set the KDE y-axis max explicitly so ECharts doesn't clip spans
    // (markLines don't participate in auto-range computation).
    const maxLetterIdx = Math.max(
      0,
      ...[...baseModes.letters, ...newModes.letters].map(
        (l) => l.charCodeAt(0) - 65,
      ),
    );
    const kdeYAxisMax = showModes
      ? maxDensity * (1.08 + maxLetterIdx * 0.45 + 0.45)
      : undefined;
    const modeOverlays: LineSeriesOption[] = [];

    // Peak-label placement: by default a label sits just to the left of the
    // leftmost of its own tick and its matched Base/New counterpart's tick
    // (so two nearby peaks share one consistent reference instead of each
    // pushing left by its own, possibly very different, width). If that
    // would run the label past the left axis, flip it to sit just to the
    // right of its own tick instead.
    const LABEL_GAP_PX = 6;
    const chartWidthPx = chartInstanceRef.current?.getWidth?.() ?? 640;
    const plotWidthPx = Math.max(1, chartWidthPx - 70 - 70);
    const pxPerUnit = plotWidthPx / (max - min || 1);
    const baseLocByLetter = new Map(
      baseModes.letters.map((l, i) => [l, baseModes.peakLocs[i]]),
    );
    const newLocByLetter = new Map(
      newModes.letters.map((l, i) => [l, newModes.peakLocs[i]]),
    );

    function pushModeOverlays(
      seriesName: 'Base' | 'New',
      modeInfo: ModeInfo,
      seriesValues: number[],
      xStart: number,
      xEnd: number,
    ) {
      if (!modeInfo.peakLocs.length) return;
      const bounds = [xStart, ...modeInfo.boundaries, xEnd];
      const isBase = seriesName === 'Base';
      // Horizontal spans must not extend past the series' own actual data —
      // xStart/xEnd come from the (padded) shared KDE grid, so clamp to the
      // real leftmost/rightmost sample value.
      const dataMin = Math.min(...seriesValues);
      const dataMax = Math.max(...seriesValues);

      modeInfo.peakLocs.forEach((loc, peakIdx) => {
        const regionStart = Math.max(bounds[peakIdx], dataMin);
        const regionEnd = Math.min(bounds[peakIdx + 1], dataMax);
        const letterIdx = modeInfo.letters[peakIdx].charCodeAt(0) - 65;
        // Each mode letter occupies its own row (stagger by letterIdx).
        // Within each row, Base sits above New with a visible gap.
        const spanY =
          maxDensity * (1.08 + letterIdx * 0.45 + (isBase ? 0.2 : 0));
        const modeColor = MODE_FILL_COLORS[letterIdx % MODE_FILL_COLORS.length];
        const letter = modeInfo.letters[peakIdx];
        const frac = modeInfo.fracs[peakIdx];
        const valueStr = (loc / scale).toFixed(decimals);
        const fracPct = Math.round(frac * 100);
        const labelText = `${seriesName} ${letter}: ${valueStr} ${displayUnit} (${fracPct}%)`;

        // Horizontal span showing the mode's x-extent (unlabeled — the
        // combined label lives on the vertical tick below).
        modeOverlays.push({
          name: seriesName,
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          z: 3,
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              [{ coord: [regionStart, spanY] }, { coord: [regionEnd, spanY] }],
            ],
            lineStyle: {
              color: modeColor,
              type: isBase ? 'solid' : 'dashed',
              width: isBase ? 2 : 1.5,
              opacity: isBase ? 1 : 0.6,
            },
            label: { show: false },
          },
        });

        // Vertical tick at the peak position, carrying the single combined
        // label (series, letter, value, fraction) above its top.
        const tickTopY = spanY + maxDensity * 0.001;
        const labelFontSize = 11;
        // Both bold — thin (normal-weight) text at 11px reads poorly even
        // with good color contrast. Base and New are told apart by color
        // (New is a darkened variant of the letter color), not weight.
        const labelFontWeight = 'bold';
        const labelColor = isBase ? modeColor : darkenHex(modeColor, 0.6);
        const labelWidthPx = measureTextWidth(
          labelText,
          labelFontSize,
          labelFontWeight,
        );
        const counterpartLoc = isBase
          ? newLocByLetter.get(letter)
          : baseLocByLetter.get(letter);
        const anchorX =
          counterpartLoc !== undefined ? Math.min(loc, counterpartLoc) : loc;
        const anchorPxFromLeft = (anchorX - min) * pxPerUnit;
        const wouldCrossLeft =
          anchorPxFromLeft - LABEL_GAP_PX - labelWidthPx < 0;
        const deltaPx = (anchorX - loc) * pxPerUnit;
        const labelAlign: 'left' | 'right' = wouldCrossLeft ? 'left' : 'right';
        const labelOffset: [number, number] = wouldCrossLeft
          ? [LABEL_GAP_PX, 4]
          : [deltaPx - LABEL_GAP_PX, 4];
        modeOverlays.push({
          name: seriesName,
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          z: 2,
          markLine: {
            silent: true,
            symbol: 'none',
            data: [[{ coord: [loc, 0] }, { coord: [loc, tickTopY] }]],
            lineStyle: {
              color: modeColor,
              type: isBase ? 'solid' : 'dashed',
              width: 1,
              opacity: 0.5,
            },
            label: {
              show: true,
              position: 'end',
              align: labelAlign,
              offset: labelOffset,
              formatter: labelText,
              color: labelColor,
              opacity: 1,
              fontSize: labelFontSize,
              fontWeight: labelFontWeight,
              backgroundColor: 'rgba(255,255,255,0.85)',
              padding: [1, 3],
              borderRadius: 2,
            },
          },
        });
      });
    }

    if (showModes) {
      const xStart = analysis.sharedX[0] ?? min;
      const xEnd = analysis.sharedX[analysis.sharedX.length - 1] ?? max;
      pushModeOverlays('Base', baseModes, baseValues, xStart, xEnd);
      pushModeOverlays('New', newModes, newValues, xStart, xEnd);

      // Shift arrows: for each matched mode letter present in both series,
      // draw a horizontal arrow from the Base peak to the New peak.
      // Color follows the metric direction; the arrow follows the raw shift.
      const basePeakByLetter = new Map(
        baseModes.peakLocs.map((loc, i) => [baseModes.letters[i], loc]),
      );
      const newPeakByLetter = new Map(
        newModes.peakLocs.map((loc, i) => [newModes.letters[i], loc]),
      );
      for (const [letter, baseLoc] of basePeakByLetter) {
        const newLoc = newPeakByLetter.get(letter);
        if (newLoc === undefined || newLoc === baseLoc) continue;
        // Skip shifts smaller than the KDE bandwidth — below that scale the
        // shift is below the smoothing resolution; this is not a significance test.
        if (sharedBw && Math.abs(newLoc - baseLoc) < sharedBw) continue;
        const letterIdx = letter.charCodeAt(0) - 65;
        // Place arrow between the New span row and the Base span row.
        const arrowY = maxDensity * (1.08 + letterIdx * 0.45 + 0.1);
        const improved = lowerIsBetter ? newLoc < baseLoc : newLoc > baseLoc;
        const arrowColor = improved
          ? Colors.IconLightSuccess
          : Colors.IconLightError;
        modeOverlays.push({
          name: 'Base',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          z: 4,
          markLine: {
            silent: true,
            symbol: ['none', 'arrow'],
            symbolSize: 8,
            data: [[{ coord: [baseLoc, arrowY] }, { coord: [newLoc, arrowY] }]],
            lineStyle: { color: arrowColor, width: 1.5 },
            label: { show: false },
          },
        });
      }
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
          splitLine: { show: true, lineStyle: { color: SPLIT_LINE_COLOR } },
          axisLine: { show: true, lineStyle: { color: AXIS_LINE_COLOR } },
        },
        {
          gridIndex: 1,
          type: 'value',
          min,
          max,
          axisLabel: { show: false },
          splitLine: { show: false },
          axisLine: { show: true, lineStyle: { color: AXIS_LINE_COLOR } },
          axisTick: { show: false },
        },
      ],
      yAxis: [
        {
          gridIndex: 0,
          type: 'value',
          min: 0,
          max: kdeYAxisMax,
          splitLine: { show: true, lineStyle: { color: SPLIT_LINE_COLOR } },
          axisLine: { show: true, lineStyle: { color: AXIS_LINE_COLOR } },
          axisTick: { show: false },
          axisLabel: {
            show: true,
            color: textColor,
            fontSize: 12,
            formatter: (v: number) => (v === 0 ? '0' : v.toPrecision(2)),
          },
        },
        {
          gridIndex: 1,
          type: 'value',
          min: -0.5,
          max: 1.5,
          interval: 1,
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { color: AXIS_LINE_COLOR } },
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
        axisPointer: {
          type: 'line',
          snap: true,
          lineStyle: { color: AXIS_LINE_COLOR },
        },
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
        // Keep the series legend above the density grid.
        top: 0,
        left: 'center',
        itemHeight: 10,
        itemWidth: 30,
        textStyle: { color: textColor },
      },
      series: [
        {
          name: 'Base',
          type: 'line',
          triggerLineEvent: true,
          xAxisIndex: 0,
          yAxisIndex: 0,
          z: 2,
          data: scaledBaseRunsDensity,
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
          z: 2,
          data: scaledNewRunsDensity,
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
          itemStyle: { color: Colors.ChartBase },
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
          itemStyle: { color: Colors.ChartNew },
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
            },
          },
        },
        ...modeOverlays,
      ],
    };
  }, [
    analysis,
    modes,
    baseValues,
    newValues,
    unit,
    themeMode,
    showModes,
    lowerIsBetter,
  ]);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          id='retrigger-modal-title'
          component='h2'
          variant='h2'
          sx={{ fontSize: '1rem' }}
        >
          Runs Density Distribution
        </Typography>
        {infoTooltip && (
          <Tooltip placement='top' title={infoTooltip} arrow>
            <InfoIcon
              fontSize='small'
              tabIndex={0}
              aria-label='How to read this graph'
              sx={{ cursor: 'help', color: 'text.secondary' }}
            />
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 0.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              checked={showModes}
              onChange={(_, checked) => onShowModesChange(checked)}
            />
          }
          label='Modal analysis'
          sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
        />
        {/*
          The sensitivity slider only makes sense while modal analysis is on —
          with it off the chart is just the KDE, so we hide the slider entirely
          rather than showing a disabled control.
        */}
        {showModes && (
          <>
            <Typography
              variant='body2'
              sx={{
                color: 'text.primary',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Mode sensitivity
              <Tooltip
                placement='top'
                title='How readily the KDE peak detector splits neighboring bumps into separate modes. Higher = more modes detected; lower = only strongly separated modes.'
              >
                <InfoIcon
                  fontSize='small'
                  sx={{ color: 'text.primary', cursor: 'help', mx: 0.5 }}
                />
              </Tooltip>
              :
            </Typography>
            {/*
              Preview chart modes during drag; update the detail panel on release.
            */}
            <Slider
              size='small'
              value={localVt}
              min={VT_MIN}
              max={VT_MAX}
              step={VT_STEP}
              onChange={(_, value) => setLocalVt(value)}
              onChangeCommitted={(_, value) => onVtChange(value)}
              aria-label='Mode sensitivity'
              sx={{ maxWidth: 240 }}
            />
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', minWidth: 36, textAlign: 'right' }}
            >
              {Math.round(localVt * 100)}%
            </Typography>
          </>
        )}
      </Box>
      <Box sx={{ flex: 0 }}>
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: CHART_HEIGHT_BASE,
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
            onChange={(_, v) => onBwMultiplierChange(v)}
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
  lowerIsBetter?: boolean;
  sharedBw: number | undefined;
  bwMultiplier: number;
  onBwMultiplierChange: (value: number) => void;
  isLargeBw: boolean;
  vt: number;
  onVtChange: (value: number) => void;
  showModes: boolean;
  onShowModesChange: (value: boolean) => void;
  infoTooltip?: string;
}

export default CommonGraph;
