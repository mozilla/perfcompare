/**
 * Shared helpers for KDE-based analysis used by both the chart (CommonGraph)
 * and the mode-breakdown blurb (KdeModesPanel). Lives outside both components
 * so they can't drift onto subtly different bandwidth / mode-detection logic.
 */
import {
  areaFracs,
  assignLetters,
  fftkde,
  fitModesFromKde,
  improvedSheatherJones,
  matchModes,
  silvermansRule,
} from './kde.js';

// Power-of-2 grid for the FFT-based KDE convolution. Both consumers use the
// same grid so that overlay markers (chart) and mode-bucket bootstrap CIs
// (blurb) are computed against an identical curve resolution.
export const KDE_GRID_POINTS = 1024;

/**
 * Per-side mode summary: peaks, their boundary x-values (used to bucket raw
 * samples for bootstrap CIs), area-under-curve fractions per mode, and the
 * A/B/C letter labels by peak location.
 */
export type ModeInfo = {
  peakLocs: number[];
  boundaries: number[];
  fracs: number[];
  letters: string[];
};

export const EMPTY_MODE_INFO: ModeInfo = {
  peakLocs: [],
  boundaries: [],
  fracs: [],
  letters: [],
};

// Linear interpolation for sorted quantiles — matches numpy.quantile's
// default behaviour. Internal helper for approximateSJBandwidth.
function quantileSorted(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

/**
 * Silverman's rule-of-thumb bandwidth:
 *
 *   bw = 0.9 * min(std, IQR / 1.34) * n^(-1/5)
 *
 * Produces a wider, smoother kernel than ISJ. We use it for top-level
 * (non-subtest) aggregated results where samples are sparse and ISJ tends
 * to over-fit. The `0.001 * |mean|` fallback covers degenerate cases where
 * std and IQR are both zero (e.g. all-identical inputs) so callers always
 * get a positive bandwidth.
 */
export function approximateSJBandwidth(values: number[]): number {
  if (values.length < 2) return Math.abs(values[0] ?? 0) * 0.001 || 1;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const iqr = quantileSorted(sorted, 0.75) - quantileSorted(sorted, 0.25);
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(
    sorted.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / n,
  );
  const sigma = Math.min(std, iqr / 1.34);
  if (sigma <= 0) return Math.abs(mean) * 0.001 || 1;
  return 0.9 * sigma * Math.pow(n, -1 / 5);
}

/**
 * Pick a bandwidth for the given samples based on caller context.
 *
 * - `isSubtest = true` → ISJ (data-driven, narrower), with Silverman's rule
 *   as a fallback if ISJ fails to converge on degenerate inputs.
 * - `isSubtest = false` → the SJ approximation above (wider, smoother).
 *
 * Returns `undefined` for samples with < 2 values; callers should pass that
 * straight through to `safeKde`, which treats undefined as "let fftkde pick".
 */
export function bandwidthFor(
  values: number[],
  isSubtest: boolean,
): number | undefined {
  if (values.length < 2) return undefined;
  if (!isSubtest) return approximateSJBandwidth(values);
  try {
    return improvedSheatherJones(values);
  } catch {
    return silvermansRule(values);
  }
}

/**
 * Defensive `fftkde` wrapper:
 * - Tries the chosen bandwidth.
 * - Falls back to Silverman if ISJ throws on degenerate inputs.
 * - Returns `null` if even Silverman fails, instead of throwing.
 *
 * Pass `bw = undefined` to let `fftkde` choose ISJ itself.
 */
export function safeKde(values: number[], bw?: number) {
  if (values.length < 2) return null;
  try {
    return fftkde(values, bw ?? 'ISJ', undefined, KDE_GRID_POINTS);
  } catch {
    try {
      return fftkde(values, 'silverman', undefined, KDE_GRID_POINTS);
    } catch {
      return null;
    }
  }
}

/**
 * Run mode detection on a KDE curve and bundle the result with area fractions
 * and letter labels. Returns the empty ModeInfo (rather than null) when there's
 * nothing to fit — callers check `peakLocs.length` to detect empty.
 */
export function computeModeInfo(
  x: number[],
  y: number[],
  vt: number,
): ModeInfo {
  if (!x.length || !y.length) return EMPTY_MODE_INFO;
  const { peakLocs, boundaries } = fitModesFromKde(x, y, vt);
  if (!peakLocs.length) return EMPTY_MODE_INFO;
  return {
    peakLocs,
    boundaries,
    fracs: areaFracs(x, y, boundaries),
    letters: assignLetters(peakLocs),
  };
}

/**
 * Combined output of the client-side modality pipeline. Used as the single
 * source of truth for any UI that needs to talk about modes (counts in the
 * Distribution Interpretation row, the Mode Δ column, KdeModesPanel, etc.)
 * so the page never contradicts itself.
 */
export type ModalityAnalysis = {
  baseModes: ModeInfo;
  newModes: ModeInfo;
  // How far the biggest group of runs moved from Base to New, as a % of the
  // base peak's position. null when there's no trustworthy group to measure
  // (see computeModalityAnalysis for the exact cases).
  dominantModeShiftPct: number | null;
};

export const EMPTY_MODALITY_ANALYSIS: ModalityAnalysis = {
  baseModes: EMPTY_MODE_INFO,
  newModes: EMPTY_MODE_INFO,
  dominantModeShiftPct: null,
};

// Each peak in the KDE curve covers some share of the runs (its "area
// fraction"); all peaks on one side add up to ~1, i.e. 100% of the runs.
// A peak must cover at least this share — 10% — to count as a real group of
// runs. Smaller peaks are treated as noise (a few stray runs) and ignored, so
// a tiny bump that happens to move a lot can't hijack the reported shift.
const MODE_AREA_FLOOR = 0.1;

/**
 * Run the full client-side modality pipeline for a base/new pair.
 *
 * Pipeline (same as `KdeModesPanel`): shared bandwidth (max of per-side
 * `bandwidthFor`), `safeKde` both sides, `computeModeInfo` to get peaks +
 * area fractions, `matchModes` to align base/new peaks. Then derives the
 * shift of the dominant matched mode — the pair holding the largest share
 * of the runs — as a signed percentage of the base peak location (positive =
 * new peak shifted higher). Picking the biggest group rather than the biggest
 * mover keeps a small, noisy peak from driving the reported number when the
 * main peak barely moved.
 *
 * `dominantModeShiftPct` is `null` when:
 *   - either side has < 2 samples
 *   - either KDE fails (e.g. degenerate inputs)
 *   - mode detection finds no peaks on either side
 *   - no matched pairs (e.g. only unmatched modes — paths appeared/disappeared)
 *   - no matched pair clears MODE_AREA_FLOOR (only noise-level modes)
 *   - the dominant matched base peak is at exactly zero (can't divide)
 *
 * Mode counts (`baseModes.peakLocs.length` / `newModes.peakLocs.length`)
 * are 0 in the same conditions that drive `dominantModeShiftPct` to null
 * (except the divide-by-zero / below-floor cases, which still yield counts).
 *
 * @param valleyThreshold Passed to `fitModesFromKde`. Defaults to 0.5 to
 *   match `RevisionRowExpandable`'s slider default; the precompute path
 *   has no slider to read from.
 */
export function computeModalityAnalysis(
  baseValues: number[],
  newValues: number[],
  isSubtest: boolean,
  valleyThreshold: number = 0.5,
): ModalityAnalysis {
  if (baseValues.length < 2 || newValues.length < 2) {
    return EMPTY_MODALITY_ANALYSIS;
  }
  const baseBw = bandwidthFor(baseValues, isSubtest) ?? 0;
  const newBw = bandwidthFor(newValues, isSubtest) ?? 0;
  const rawSharedBw = Math.max(baseBw, newBw);
  const sharedBw = rawSharedBw > 0 ? rawSharedBw : undefined;
  const bKde = safeKde(baseValues, sharedBw);
  const nKde = safeKde(newValues, sharedBw);
  if (!bKde || !nKde) return EMPTY_MODALITY_ANALYSIS;
  const baseModes = computeModeInfo(bKde.x, bKde.y, valleyThreshold);
  const newModes = computeModeInfo(nKde.x, nKde.y, valleyThreshold);
  if (!baseModes.peakLocs.length || !newModes.peakLocs.length) {
    return { baseModes, newModes, dominantModeShiftPct: null };
  }
  const { pairs } = matchModes(
    baseModes.peakLocs,
    baseModes.fracs,
    newModes.peakLocs,
    newModes.fracs,
  );
  // Report how far the biggest group of runs moved — not whichever peak moved
  // the most. Each matched pair's "size" is the average share of runs under
  // its two peaks; pairs smaller than MODE_AREA_FLOOR are noise and skipped.
  // Of the rest we keep the largest (the dominant group) and use its shift.
  let dominantModeShiftPct: number | null = null;
  let bestMag = -Infinity;
  for (const [bi, ni] of pairs) {
    const baseLoc = baseModes.peakLocs[bi];
    const newLoc = newModes.peakLocs[ni];
    if (baseLoc === 0) continue; // can't express the shift as a percentage
    const mag = (baseModes.fracs[bi] + newModes.fracs[ni]) / 2;
    if (mag < MODE_AREA_FLOOR || mag <= bestMag) continue;
    bestMag = mag;
    dominantModeShiftPct = ((newLoc - baseLoc) / baseLoc) * 100;
  }
  return { baseModes, newModes, dominantModeShiftPct };
}
