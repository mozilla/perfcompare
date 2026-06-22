import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { bootstrapMedianDiffCI } from '../../utils/bootstrap-ci';
import { matchModes, splitByMode } from '../../utils/kde.js';
import {
  computeModeInfo,
  safeKde,
  type ModeInfo,
} from '../../utils/kdeAnalysis';

const PALETTE = {
  light: {
    ok: Colors.IconLightSuccess,
    bad: Colors.IconLightError,
    mixed: Colors.ModesPanelMixed,
    muted: Colors.TextMuted, // neutral verdict / "no reliable change" arrow
    subtle: Colors.TextSubtle, // captions: 95% CI brackets, mode-count line
  },
  dark: {
    ok: Colors.ModesPanelSuccessDark,
    bad: Colors.ModesPanelRegressionDark,
    mixed: Colors.ModesPanelMixedDark,
    muted: Colors.SecondaryTextDark,
    subtle: Colors.TertiaryTextDark,
  },
} as const;

type Palette = (typeof PALETTE)[keyof typeof PALETTE];

type Verdict = {
  text: string;
  kind: 'improvement' | 'regression' | 'mixed' | 'neutral';
};

// Significance test ported from kde-widget.js: CI sits entirely on one side
// AND isn't the degenerate [0, 0] interval.
function isSignificant(ciLow: number, ciHigh: number): boolean {
  return (
    (ciHigh <= 0 && (ciLow < 0 || ciHigh < 0)) ||
    (ciLow >= 0 && (ciLow > 0 || ciHigh > 0))
  );
}

// better / mid / worse path label by letter rank.
// Rank uses location order (A = lowest x, last letter = highest x). Whether
// that's "better" or "worse" depends on the metric: time/memory are lower-is-
// better, throughput/score are higher-is-better.
function pathLabel(
  letter: string,
  totalModes: number,
  lowerIsBetter: boolean,
): string | null {
  const rank = letter.charCodeAt(0) - 65;
  if (totalModes <= 1) return null;
  const betterEnd = lowerIsBetter ? 0 : totalModes - 1;
  const worseEnd = lowerIsBetter ? totalModes - 1 : 0;
  if (rank === betterEnd) return 'better path';
  if (rank === worseEnd) return 'worse path';
  return 'mid path';
}

function fmtVal(v: number): string {
  const a = Math.abs(v);
  return a < 10 ? v.toFixed(2) : a < 100 ? v.toFixed(1) : v.toFixed(0);
}

const sign = (n: number) => (n >= 0 ? '+' : '');

type PairResult = {
  baseIdx: number;
  newIdx: number;
  ci: { medianDiff: number; ciLow: number; ciHigh: number } | null;
  sig: boolean;
};

// Pre-resolved "nearest peer on the other side" + improved/regressed flag for
// each unmatched mode. Computed once during blurb assembly so the JSX rows
// don't have to .reduce() over peak locations on every parent re-render.
type UnmatchedRow = {
  modeIdx: number;
  improved: boolean;
};

type Blurb = {
  pairs: PairResult[];
  improvements: PairResult[];
  regressions: PairResult[];
  unmatchedBase: UnmatchedRow[]; // base modes with no new pair
  unmatchedNew: UnmatchedRow[]; // new modes with no base pair
  baseModes: ModeInfo;
  newModes: ModeInfo;
};

function computeBlurb(
  baseValues: number[],
  newValues: number[],
  vt: number,
  sharedBw: number | undefined,
  lowerIsBetter: boolean,
): Blurb | null {
  const bKde = safeKde(baseValues, sharedBw);
  const nKde = safeKde(newValues, sharedBw);
  if (!bKde || !nKde) return null;
  const bModes = computeModeInfo(bKde.x, bKde.y, vt);
  const nModes = computeModeInfo(nKde.x, nKde.y, vt);
  if (!bModes.peakLocs.length || !nModes.peakLocs.length) return null;

  // Single-mode-on-both-sides: the Δ-median alert already covers it.
  if (bModes.peakLocs.length === 1 && nModes.peakLocs.length === 1) return null;

  const m = matchModes(
    bModes.peakLocs,
    bModes.fracs,
    nModes.peakLocs,
    nModes.fracs,
  );

  const baseSplits = splitByMode(baseValues, bModes.boundaries);
  const newSplits = splitByMode(newValues, nModes.boundaries);

  const pairs: PairResult[] = m.pairs.map(([baseIdx, newIdx]) => {
    const left = baseSplits[baseIdx] ?? [];
    const right = newSplits[newIdx] ?? [];
    const ci =
      left.length >= 2 && right.length >= 2
        ? bootstrapMedianDiffCI(left, right)
        : null;
    const sig = ci ? isSignificant(ci.ciLow, ci.ciHigh) : false;
    return { baseIdx, newIdx, ci, sig };
  });

  // Pre-resolve each unmatched mode's nearest peer on the other side and
  // whether the move counts as an improvement. "Improved" depends on the
  // metric direction: for lower-is-better, moving to a smaller value is
  // better; for higher-is-better it flips.
  const isImproved = (movedTo: number, movedFrom: number) =>
    lowerIsBetter ? movedTo < movedFrom : movedTo > movedFrom;

  const ub: UnmatchedRow[] = m.ub.map((modeIdx) => {
    const baseLoc = bModes.peakLocs[modeIdx];
    const nearestNew = nModes.peakLocs.reduce((a, b) =>
      Math.abs(b - baseLoc) < Math.abs(a - baseLoc) ? b : a,
    );
    return { modeIdx, improved: isImproved(nearestNew, baseLoc) };
  });
  const un: UnmatchedRow[] = m.un.map((modeIdx) => {
    const newLoc = nModes.peakLocs[modeIdx];
    const nearestBase = bModes.peakLocs.reduce((a, b) =>
      Math.abs(b - newLoc) < Math.abs(a - newLoc) ? b : a,
    );
    return { modeIdx, improved: isImproved(newLoc, nearestBase) };
  });

  // Pair improvement/regression also depends on the metric direction.
  const isPairImprovement = (p: PairResult) =>
    p.sig &&
    !!p.ci &&
    (lowerIsBetter ? p.ci.medianDiff < 0 : p.ci.medianDiff > 0);
  const isPairRegression = (p: PairResult) =>
    p.sig &&
    !!p.ci &&
    (lowerIsBetter ? p.ci.medianDiff > 0 : p.ci.medianDiff < 0);

  return {
    pairs,
    improvements: pairs.filter(isPairImprovement),
    regressions: pairs.filter(isPairRegression),
    unmatchedBase: ub,
    unmatchedNew: un,
    baseModes: bModes,
    newModes: nModes,
  };
}

// Returns the verdict's semantic kind + text. The caller maps `kind` to a
// theme-aware color so this function stays pure (and stable across renders).
// Phrasing is metric-direction-aware: a new path appearing at the worse end
// (highest x for lower-is-better, lowest x for higher-is-better) counts as a
// regression signal.
function verdict(blurb: Blurb, lowerIsBetter: boolean): Verdict {
  const sigCount = blurb.pairs.filter((p) => p.sig).length;
  if (
    blurb.unmatchedBase.length === 0 &&
    blurb.unmatchedNew.length === 0 &&
    sigCount === 0
  ) {
    return { text: 'No reliable change in any mode', kind: 'neutral' };
  }

  const bN = blurb.baseModes.peakLocs.length;
  const nN = blurb.newModes.peakLocs.length;
  const betterEnd = (n: number) => (lowerIsBetter ? 0 : n - 1);
  const worseEnd = (n: number) => (lowerIsBetter ? n - 1 : 0);

  // A new path appearing at the worse end of the new distribution leans
  // regression; a base path on the better end going missing also leans
  // regression. A base path on the worse end going missing leans improvement.
  const newWorsePaths = blurb.unmatchedNew.filter(
    (r) => r.modeIdx === worseEnd(nN),
  ).length;
  const lostBetterPaths = blurb.unmatchedBase.filter(
    (r) => r.modeIdx === betterEnd(bN) && bN > 1,
  ).length;
  const elimWorsePaths = blurb.unmatchedBase.filter(
    (r) => r.modeIdx === worseEnd(bN),
  ).length;

  if (
    blurb.regressions.length === 0 &&
    newWorsePaths === 0 &&
    lostBetterPaths === 0 &&
    (blurb.improvements.length > 0 || elimWorsePaths > 0)
  ) {
    return { text: 'Overall improvement', kind: 'improvement' };
  }
  if (
    blurb.improvements.length === 0 &&
    elimWorsePaths === 0 &&
    (blurb.regressions.length > 0 || newWorsePaths > 0 || lostBetterPaths > 0)
  ) {
    return { text: 'Overall regression', kind: 'regression' };
  }
  return { text: '⚠ Mixed results', kind: 'mixed' };
}

function colorForKind(kind: Verdict['kind'], palette: Palette): string {
  switch (kind) {
    case 'improvement':
      return palette.ok;
    case 'regression':
      return palette.bad;
    case 'mixed':
      return palette.mixed;
    default:
      return palette.muted;
  }
}

type CiLineProps = {
  ci: { medianDiff: number; ciLow: number; ciHigh: number } | null;
  sig: boolean;
  baseLoc: number;
  unit: string;
  palette: Palette;
  lowerIsBetter: boolean;
};

function CiLine({
  ci,
  sig,
  baseLoc,
  unit,
  palette,
  lowerIsBetter,
}: CiLineProps) {
  if (!ci) return <Box sx={{ color: palette.subtle }}>no CI available</Box>;
  // "Improvement" means the value moved in the metric's preferred direction.
  // Arrows describe raw direction-of-change (▼ for lower, ▲ for higher); the
  // word interprets that direction against `lowerIsBetter`.
  const wentDown = ci.medianDiff < 0;
  const isImprovement = sig && (lowerIsBetter ? wentDown : !wentDown);
  const isRegression = sig && (lowerIsBetter ? !wentDown : wentDown);
  const color = isImprovement
    ? palette.ok
    : isRegression
      ? palette.bad
      : palette.muted;
  const arrow = !sig
    ? 'no reliable change'
    : isImprovement
      ? `${wentDown ? '▼' : '▲'} improvement`
      : `${wentDown ? '▼' : '▲'} regression`;
  const pct = baseLoc > 0 ? (ci.medianDiff / baseLoc) * 100 : 0;
  return (
    <Box>
      <Box component='span' sx={{ color, fontWeight: sig ? 'bold' : 'normal' }}>
        {arrow}
      </Box>
      {'  '}
      {sign(ci.medianDiff)}
      {fmtVal(ci.medianDiff)} {unit}
      {sig && baseLoc > 0 ? (
        <Box component='span' sx={{ color }}>
          {' '}
          ({sign(pct)}
          {pct.toFixed(1)}%)
        </Box>
      ) : null}
      <Box component='span' sx={{ color: palette.subtle }}>
        {'  '}95% CI [{sign(ci.ciLow)}
        {fmtVal(ci.ciLow)}, {sign(ci.ciHigh)}
        {fmtVal(ci.ciHigh)}]
      </Box>
    </Box>
  );
}

type KdeModesPanelProps = {
  baseValues: number[];
  newValues: number[];
  unit: string | null;
  sharedBw: number | undefined;
  vt: number;
  showModes: boolean;
  // True when smaller values are preferred (e.g. latency, memory). False for
  // throughput/score-style metrics. Drives improvement/regression wording so
  // the blurb doesn't presuppose timing.
  lowerIsBetter: boolean;
};

function KdeModesPanel({
  baseValues,
  newValues,
  unit,
  sharedBw,
  vt,
  showModes,
  lowerIsBetter,
}: KdeModesPanelProps) {
  // ECharts-equivalent reasoning: MUI's ThemeProvider sets the Box background
  // for us, but the inline text colors for the success/regression signals
  // aren't part of the MUI theme, so we resolve them by hand from the Redux
  // theme slice and pick the appropriate pale-vs-saturated variant.
  const themeMode = useAppSelector((state) => state.theme.mode);
  const palette = themeMode === 'dark' ? PALETTE.dark : PALETTE.light;

  const blurb = useMemo(
    () =>
      showModes
        ? computeBlurb(baseValues, newValues, vt, sharedBw, lowerIsBetter)
        : null,
    [baseValues, newValues, vt, showModes, sharedBw, lowerIsBetter],
  );

  // Cheap derivations that nonetheless re-execute on every parent re-render
  // (e.g. theme switch) unless memoized. Keys only on the inputs that actually
  // affect the result; `unit`, `blurb`, `palette`, and `lowerIsBetter` are the
  // only relevant ones.
  const derived = useMemo(() => {
    if (!blurb) return null;
    const baseCount = blurb.baseModes.peakLocs.length;
    const newCount = blurb.newModes.peakLocs.length;
    const v = verdict(blurb, lowerIsBetter);
    return {
      v,
      verdictColor: colorForKind(v.kind, palette),
      unitLabel: unit ?? 'samples/iter',
      baseCount,
      newCount,
      modeStr:
        `${baseCount === 1 ? '1 mode' : `${baseCount} modes`} base · ` +
        `${newCount === 1 ? '1 mode' : `${newCount} modes`} new`,
    };
  }, [blurb, unit, palette, lowerIsBetter]);

  if (!blurb || !derived) return null;

  const { pairs, unmatchedBase, unmatchedNew, baseModes, newModes } = blurb;
  const { v, verdictColor, unitLabel, baseCount, newCount, modeStr } = derived;

  return (
    <Box
      aria-label='Mode-by-mode breakdown'
      sx={{
        backgroundColor: 'manWhitneyComps.background',
        padding: 1.5,
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography
          variant='subtitle1'
          sx={{ color: verdictColor, fontWeight: 'bold' }}
        >
          {v.text}
        </Typography>
        <Typography variant='caption' sx={{ color: palette.subtle }}>
          {modeStr}
        </Typography>
      </Box>

      {pairs.map((r) => {
        const letter = baseModes.letters[r.baseIdx];
        const baseLoc = baseModes.peakLocs[r.baseIdx];
        const baseFrac = baseModes.fracs[r.baseIdx];
        const newFrac = newModes.fracs[r.newIdx];
        const fracDelta = newFrac - baseFrac;
        const path = pathLabel(letter, baseCount, lowerIsBetter);
        const fracStr =
          Math.abs(fracDelta) >= 0.03
            ? `${Math.round(baseFrac * 100)}% → ${Math.round(newFrac * 100)}%`
            : `${Math.round(baseFrac * 100)}% of runs`;
        return (
          <Box key={`pair-${r.baseIdx}-${r.newIdx}`} sx={{ mt: 1 }}>
            <Box>
              <Box component='b'>Mode {letter}</Box>
              {path ? (
                <Box component='span' sx={{ color: palette.subtle }}>
                  {' '}
                  {path}
                </Box>
              ) : null}{' '}
              ~{fmtVal(baseLoc)} {unitLabel} {fracStr}
            </Box>
            <CiLine
              ci={r.ci}
              sig={r.sig}
              baseLoc={baseLoc}
              unit={unitLabel}
              palette={palette}
              lowerIsBetter={lowerIsBetter}
            />
          </Box>
        );
      })}

      {unmatchedBase.map(({ modeIdx, improved }) => {
        const letter = baseModes.letters[modeIdx];
        const baseLoc = baseModes.peakLocs[modeIdx];
        const frac = baseModes.fracs[modeIdx];
        const path = pathLabel(letter, baseCount, lowerIsBetter);
        return (
          <Box key={`ub-${modeIdx}`} sx={{ mt: 1 }}>
            <Box>
              <Box component='b'>Mode {letter}</Box>
              {path ? (
                <Box component='span' sx={{ color: palette.subtle }}>
                  {' '}
                  {path}
                </Box>
              ) : null}{' '}
              ~{fmtVal(baseLoc)} {unitLabel} {Math.round(frac * 100)}% of base
              runs
            </Box>
            <Box
              sx={{
                color: improved ? palette.ok : palette.bad,
                fontWeight: 'bold',
              }}
            >
              {improved
                ? '✓ gone — these runs merged into a better path'
                : '⚠ gone — these runs merged into a worse path'}
            </Box>
          </Box>
        );
      })}

      {unmatchedNew.map(({ modeIdx, improved }) => {
        const letter = newModes.letters[modeIdx];
        const newLoc = newModes.peakLocs[modeIdx];
        const frac = newModes.fracs[modeIdx];
        const path = pathLabel(letter, newCount, lowerIsBetter);
        return (
          <Box key={`un-${modeIdx}`} sx={{ mt: 1 }}>
            <Box>
              <Box component='b'>Mode {letter}</Box>
              {path ? (
                <Box component='span' sx={{ color: palette.subtle }}>
                  {' '}
                  {path}
                </Box>
              ) : null}{' '}
              ~{fmtVal(newLoc)} {unitLabel} {Math.round(frac * 100)}% of new
              runs
            </Box>
            <Box
              sx={{
                color: improved ? palette.ok : palette.bad,
                fontWeight: 'bold',
              }}
            >
              {improved
                ? '✓ new path — these runs improved versus the nearest base mode'
                : '⚠ new path — these runs regressed versus the nearest base mode'}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default KdeModesPanel;
