import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useAppSelector } from '../../hooks/app';
import { Colors } from '../../styles/Colors';
import { bootstrapMedianDiffCI } from '../../utils/bootstrap-ci';
import { matchModes, splitByMode } from '../../utils/kde.js';
import {
  bandwidthFor,
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

// fast / mid / slow path label by letter rank (A = fastest).
function pathLabel(letter: string, totalModes: number): string | null {
  const rank = letter.charCodeAt(0) - 65;
  if (totalModes <= 1) return null;
  if (rank === 0) return 'fast path';
  if (rank === totalModes - 1) return 'slow path';
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
  isSubtest: boolean,
): Blurb | null {
  const bKde = safeKde(baseValues, bandwidthFor(baseValues, isSubtest));
  const nKde = safeKde(newValues, bandwidthFor(newValues, isSubtest));
  if (!bKde || !nKde) return null;
  const bModes = computeModeInfo(Array.from(bKde.x), Array.from(bKde.y), vt);
  const nModes = computeModeInfo(Array.from(nKde.x), Array.from(nKde.y), vt);
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
  // whether that peer is faster — saves a .reduce() per row on every parent
  // re-render.
  const ub: UnmatchedRow[] = m.ub.map((modeIdx) => {
    const baseLoc = bModes.peakLocs[modeIdx];
    const nearestNew = nModes.peakLocs.reduce((a, b) =>
      Math.abs(b - baseLoc) < Math.abs(a - baseLoc) ? b : a,
    );
    return { modeIdx, improved: baseLoc > nearestNew };
  });
  const un: UnmatchedRow[] = m.un.map((modeIdx) => {
    const newLoc = nModes.peakLocs[modeIdx];
    const nearestBase = bModes.peakLocs.reduce((a, b) =>
      Math.abs(b - newLoc) < Math.abs(a - newLoc) ? b : a,
    );
    return { modeIdx, improved: newLoc < nearestBase };
  });

  return {
    pairs,
    improvements: pairs.filter((p) => p.sig && p.ci && p.ci.medianDiff < 0),
    regressions: pairs.filter((p) => p.sig && p.ci && p.ci.medianDiff > 0),
    unmatchedBase: ub,
    unmatchedNew: un,
    baseModes: bModes,
    newModes: nModes,
  };
}

// Returns the verdict's semantic kind + text. The caller maps `kind` to a
// theme-aware color so this function stays pure (and stable across renders).
function verdict(blurb: Blurb): Verdict {
  const sigCount = blurb.pairs.filter((p) => p.sig).length;
  if (
    blurb.unmatchedBase.length === 0 &&
    blurb.unmatchedNew.length === 0 &&
    sigCount === 0
  ) {
    return { text: 'No reliable change in any mode', kind: 'neutral' };
  }
  // "Slow path appeared" / "fast path lost" treated as worse-leaning signals.
  const newSlowPaths = blurb.unmatchedNew.filter(
    (r) => r.modeIdx === blurb.newModes.peakLocs.length - 1,
  ).length;
  const lostFastPaths = blurb.unmatchedBase.filter(
    (r) => r.modeIdx === 0 && blurb.baseModes.peakLocs.length > 1,
  ).length;
  // Eliminated slow paths lean improvement.
  const elimSlowPaths = blurb.unmatchedBase.filter(
    (r) => r.modeIdx === blurb.baseModes.peakLocs.length - 1,
  ).length;

  if (
    blurb.regressions.length === 0 &&
    newSlowPaths === 0 &&
    lostFastPaths === 0 &&
    (blurb.improvements.length > 0 || elimSlowPaths > 0)
  ) {
    return { text: '▼ Overall faster', kind: 'improvement' };
  }
  if (
    blurb.improvements.length === 0 &&
    elimSlowPaths === 0 &&
    (blurb.regressions.length > 0 || newSlowPaths > 0 || lostFastPaths > 0)
  ) {
    return { text: '▲ Overall slower', kind: 'regression' };
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
};

function CiLine({ ci, sig, baseLoc, unit, palette }: CiLineProps) {
  if (!ci) return <Box sx={{ color: palette.subtle }}>no CI available</Box>;
  const color = sig
    ? ci.medianDiff < 0
      ? palette.ok
      : palette.bad
    : palette.muted;
  const arrow = sig
    ? ci.medianDiff < 0
      ? '▼ faster'
      : '▲ slower'
    : 'no reliable change';
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
  vt: number;
  showModes: boolean;
  isSubtest: boolean;
};

function KdeModesPanel({
  baseValues,
  newValues,
  unit,
  vt,
  showModes,
  isSubtest,
}: KdeModesPanelProps) {
  // ECharts-equivalent reasoning: MUI's ThemeProvider sets the Box background
  // for us, but the inline text colors for the success/regression signals
  // aren't part of the MUI theme, so we resolve them by hand from the Redux
  // theme slice and pick the appropriate pale-vs-saturated variant.
  const themeMode = useAppSelector((state) => state.theme.mode);
  const palette = themeMode === 'dark' ? PALETTE.dark : PALETTE.light;

  const blurb = useMemo(
    () =>
      showModes ? computeBlurb(baseValues, newValues, vt, isSubtest) : null,
    [baseValues, newValues, vt, showModes, isSubtest],
  );

  // Cheap derivations that nonetheless re-execute on every parent re-render
  // (e.g. theme switch) unless memoized. Keys only on the inputs that actually
  // affect the result; `unit`, `blurb`, and `palette` are the only relevant ones.
  const derived = useMemo(() => {
    if (!blurb) return null;
    const baseCount = blurb.baseModes.peakLocs.length;
    const newCount = blurb.newModes.peakLocs.length;
    const v = verdict(blurb);
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
  }, [blurb, unit, palette]);

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
        const path = pathLabel(letter, baseCount);
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
            />
          </Box>
        );
      })}

      {unmatchedBase.map(({ modeIdx, improved }) => {
        const letter = baseModes.letters[modeIdx];
        const baseLoc = baseModes.peakLocs[modeIdx];
        const frac = baseModes.fracs[modeIdx];
        const path = pathLabel(letter, baseCount);
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
                ? '✓ gone — these runs are now faster (merged into a quicker path)'
                : '⚠ gone — these runs are now slower (merged into a slower path)'}
            </Box>
          </Box>
        );
      })}

      {unmatchedNew.map(({ modeIdx, improved }) => {
        const letter = newModes.letters[modeIdx];
        const newLoc = newModes.peakLocs[modeIdx];
        const frac = newModes.fracs[modeIdx];
        const path = pathLabel(letter, newCount);
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
                ? '✓ new path — these runs are now faster than before'
                : '⚠ new path — these runs are now slower than before'}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default KdeModesPanel;
