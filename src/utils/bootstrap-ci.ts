/**
 * Percentile bootstrap confidence interval for the difference of medians.
 *
 * No external dependencies.
 */

function median(arr: ArrayLike<number>): number {
  const s = new Float64Array(arr).sort();
  const m = s.length >> 1;
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function resample(arr: Float64Array, rng: () => number): Float64Array {
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[Math.floor(rng() * arr.length)];
  }
  return out;
}

// Mulberry32 — fast seedable PRNG so results are reproducible.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

export type BootstrapCI = {
  medianDiff: number;
  ciLow: number;
  ciHigh: number;
  significant: boolean; // CI does not contain 0
};

/**
 * Percentile bootstrap confidence interval for (median(newData) - median(base)).
 * Matches scipy.stats.bootstrap(..., method="percentile", paired=False).
 *
 * How it works
 * ------------
 * A confidence interval answers: "given the samples we observed, what is the
 * plausible range for the true difference?"  The bootstrap approach avoids
 * assumptions about the underlying distribution (normality, etc.) by
 * simulating the sampling process directly:
 *
 *   1. Draw nIter synthetic datasets by sampling WITH replacement from each
 *      input array (a "resample" — same size, but some values repeat and some
 *      are absent).
 *   2. Compute (median(resampledNew) - median(resampledBase)) for each pair.
 *   3. Sort the resulting nIter differences.
 *   4. The CI is the [alpha/2, 1-alpha/2] percentile range of that distribution.
 *
 * If the CI does not straddle zero, the difference is statistically significant
 * at the chosen alpha level.
 *
 * @param base    - baseline sample values (e.g. before-patch timings)
 * @param newData - new/comparison sample values (e.g. after-patch timings)
 * @param nIter   - number of bootstrap resamples; 1000 is sufficient for most
 *                  uses, increase to 10 000 for publication-quality intervals
 * @param alpha   - two-tailed significance level: the CI covers (1-alpha) of the
 *                  bootstrap distribution, e.g. 0.05 → 95% CI, 0.01 → 99% CI
 * @param seed    - PRNG seed; fix this to get reproducible results across runs
 */
export function bootstrapMedianDiffCI(
  base: number[],
  newData: number[],
  nIter: number = 1000,
  alpha: number = 0.05,
  seed: number = 42,
): BootstrapCI {
  const rng = mulberry32(seed);
  const baseArr = new Float64Array(base);
  const newArr = new Float64Array(newData);
  const diffs = new Float64Array(nIter);
  for (let i = 0; i < nIter; i++) {
    diffs[i] = median(resample(newArr, rng)) - median(resample(baseArr, rng));
  }
  diffs.sort();
  const loIdx = Math.floor((alpha / 2) * nIter);
  const hiIdx = Math.min(Math.floor((1 - alpha / 2) * nIter), nIter - 1);
  const ciLow = diffs[loIdx];
  const ciHigh = diffs[hiIdx];
  return {
    medianDiff: median(newData) - median(base),
    ciLow,
    ciHigh,
    significant: ciLow > 0 || ciHigh < 0,
  };
}
