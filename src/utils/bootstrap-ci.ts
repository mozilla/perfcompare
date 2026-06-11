/**
 * BCa (bias-corrected and accelerated) bootstrap confidence interval for the
 * difference of medians.
 *
 * Matches scipy.stats.bootstrap(..., method='BCa', paired=False).
 *
 * References:
 *   DiCiccio, T. J. & Efron, B. (1996): Bootstrap confidence intervals.
 *     Statistical Science 11(3), 189-228.
 *   Acklam, P. J. (2003): An algorithm for computing the inverse normal
 *     cumulative distribution function.
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

// Abramowitz & Stegun 7.1.26 — max error 1.5e-7
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const p =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return (x >= 0 ? 1 : -1) * (1 - p * Math.exp(-x * x));
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// Acklam rational approximation — max absolute error 1.15e-9
function normalPPF(p: number): number {
  const a = [
    -3.969683028665376e1, 2.2094609842452e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= 1 - pLow) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

// Leave-one-out jackknife estimates of (median(new) - median(base)) for the
// two-sample case: leave out each base observation in turn, then each new
// observation in turn.
function jackknifeDiffs(baseArr: Float64Array, newArr: Float64Array): number[] {
  const medNew = median(newArr);
  const medBase = median(baseArr);
  const jack: number[] = [];
  for (let i = 0; i < baseArr.length; i++) {
    const leave = new Float64Array(baseArr.length - 1);
    for (let j = 0, k = 0; j < baseArr.length; j++) {
      if (j !== i) leave[k++] = baseArr[j];
    }
    jack.push(medNew - median(leave));
  }
  for (let i = 0; i < newArr.length; i++) {
    const leave = new Float64Array(newArr.length - 1);
    for (let j = 0, k = 0; j < newArr.length; j++) {
      if (j !== i) leave[k++] = newArr[j];
    }
    jack.push(median(leave) - medBase);
  }
  return jack;
}

export type BootstrapCI = {
  medianDiff: number;
  ciLow: number;
  ciHigh: number;
  significant: boolean; // CI does not contain 0
};

/**
 * BCa bootstrap confidence interval for (median(newData) - median(base)).
 *
 * BCa improves on the basic percentile method by correcting for:
 *   - Bias: the bootstrap distribution may be shifted relative to the true
 *     sampling distribution (z0, the bias-correction factor).
 *   - Skewness: the interval may need to be asymmetric (a, the acceleration,
 *     estimated via leave-one-out jackknife).
 *
 * @param base    - baseline sample values
 * @param newData - new/comparison sample values
 * @param nIter   - bootstrap resamples; 9999 is standard for BCa
 * @param alpha   - two-tailed level: CI covers (1-alpha), e.g. 0.05 → 95% CI
 * @param seed    - PRNG seed for reproducibility
 */
export function bootstrapMedianDiffCI(
  base: number[],
  newData: number[],
  nIter: number = 9999,
  alpha: number = 0.05,
  seed: number = 42,
): BootstrapCI {
  const rng = mulberry32(seed);
  const baseArr = new Float64Array(base);
  const newArr = new Float64Array(newData);
  const observed = median(newArr) - median(baseArr);

  // Bootstrap distribution
  const diffs = new Float64Array(nIter);
  for (let i = 0; i < nIter; i++) {
    diffs[i] = median(resample(newArr, rng)) - median(resample(baseArr, rng));
  }

  // Bias-correction: proportion of bootstrap samples strictly below observed,
  // clamped away from 0 and 1 to keep normalPPF finite.
  let below = 0;
  for (let i = 0; i < nIter; i++) if (diffs[i] < observed) below++;
  const prop = Math.max(0.5 / nIter, Math.min(1 - 0.5 / nIter, below / nIter));
  const z0 = normalPPF(prop);

  // Acceleration via jackknife
  const jack = jackknifeDiffs(baseArr, newArr);
  const jackMean = jack.reduce((s, v) => s + v, 0) / jack.length;
  const num = jack.reduce((s, v) => s + Math.pow(jackMean - v, 3), 0);
  const denom =
    6 *
    Math.pow(
      jack.reduce((s, v) => s + Math.pow(jackMean - v, 2), 0),
      1.5,
    );
  const a = denom === 0 ? 0 : num / denom;

  // BCa-adjusted quantile indices
  const zLow = normalPPF(alpha / 2);
  const zHigh = normalPPF(1 - alpha / 2);
  const adj = (z: number) => {
    const denom = 1 - a * (z0 + z);
    return denom === 0 ? (z < 0 ? 0 : 1) : normalCDF(z0 + (z0 + z) / denom);
  };
  const alpha1 = adj(zLow);
  const alpha2 = adj(zHigh);

  diffs.sort();
  const loIdx = Math.max(0, Math.min(Math.floor(alpha1 * nIter), nIter - 1));
  const hiIdx = Math.max(0, Math.min(Math.floor(alpha2 * nIter), nIter - 1));

  const ciLow = diffs[loIdx];
  const ciHigh = diffs[hiIdx];
  return {
    medianDiff: observed,
    ciLow,
    ciHigh,
    significant: ciLow > 0 || ciHigh < 0,
  };
}
