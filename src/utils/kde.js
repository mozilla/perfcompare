/**
 * Faithful 1D port of KDEpy's FFTKDE with ISJ bandwidth for a Gaussian kernel.
 *
 * References:
 *   Botev, Z. I., Grotowski, J. F. and Kroese, D. P. (2010):
 *     Kernel density estimation via diffusion. Ann. Stat. 38(5), 2916-2957.
 *   Fan, J. and Marron, J. S. (1994): Fast implementations of nonparametric
 *     curve estimators. J. Comput. Graph. Stat. 3(1), 35-56.
 *   KDEpy: https://github.com/tommyod/KDEpy  (BSD 3-Clause licence)
 */
// ---------------------------------------------------------------------------
// FFT — Cooley-Tukey radix-2 DIT, in-place on Float64Arrays
// ---------------------------------------------------------------------------
function fftInPlace(re, im) {
  const N = re.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < N; i++) {
    let bit = N >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      let t = re[i];
      re[i] = re[j];
      re[j] = t;
      t = im[i];
      im[i] = im[j];
      im[j] = t;
    }
  }
  // Butterfly passes
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    // W = exp(-2*pi*i/len) = exp(-pi*i/half)
    const ang = -Math.PI / half;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cRe = 1.0,
        cIm = 0.0;
      for (let k = 0; k < half; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + half] * cRe - im[i + k + half] * cIm;
        const vIm = re[i + k + half] * cIm + im[i + k + half] * cRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + half] = uRe - vRe;
        im[i + k + half] = uIm - vIm;
        const nextCRe = cRe * wRe - cIm * wIm;
        cIm = cRe * wIm + cIm * wRe;
        cRe = nextCRe;
      }
    }
  }
}
// ---------------------------------------------------------------------------
// DCT-II — matches scipy.fftpack.dct(x, type=2, norm=None)
// Uses Lee's O(N log N) FFT-based reduction. N must be a power of 2.
//
// Algorithm: reorder as v[n]=x[2n], v[N-1-n]=x[2n+1], then
//   y[k] = 2 * Re( FFT(v)[k] * exp(-i*pi*k/(2N)) )
// ---------------------------------------------------------------------------
/**
 * Type-II Discrete Cosine Transform.
 *
 * Used internally by improvedSheatherJones to transform the binned data into
 * frequency space, where the ISJ fixed-point equation can be evaluated
 * efficiently.  Not needed directly in typical usage — call fftkde instead.
 *
 * @param x - real-valued array whose length must be a power of 2
 * @returns DCT-II coefficients, same length as x
 */
export function dct2(x) {
  const N = x.length;
  if (N < 2 || (N & (N - 1)) !== 0)
    throw new Error(`dct2 requires power-of-2 length, got ${N}`);
  const half = N >> 1;
  const v = new Float64Array(N);
  for (let n = 0; n < half; n++) {
    v[n] = x[2 * n];
    v[N - 1 - n] = x[2 * n + 1];
  }
  const re = new Float64Array(v);
  const im = new Float64Array(N);
  fftInPlace(re, im);
  const y = new Array(N);
  for (let k = 0; k < N; k++) {
    const angle = (-Math.PI * k) / (2 * N);
    y[k] = 2 * (re[k] * Math.cos(angle) - im[k] * Math.sin(angle));
  }
  return y;
}
// ---------------------------------------------------------------------------
// Brent's root-finding — matches scipy.optimize.brentq
// ---------------------------------------------------------------------------
function brentq(f, a, b, xtol = 2e-12, rtol = 4.4e-16, maxIter = 100) {
  let fa = f(a);
  let fb = f(b);
  if (fa === 0) return { x: a, converged: true };
  if (fb === 0) return { x: b, converged: true };
  if (fa * fb > 0) return { x: 0, converged: false };
  let c = b,
    fc = fb;
  let d = 0,
    e = 0;
  for (let iter = 0; iter < maxIter; iter++) {
    if (fb * fc > 0) {
      c = a;
      fc = fa;
      d = e = b - a;
    }
    if (Math.abs(fc) < Math.abs(fb)) {
      a = b;
      fa = fb;
      b = c;
      fb = fc;
      c = a;
      fc = fa;
    }
    const tol1 = 2 * rtol * Math.abs(b) + 0.5 * xtol;
    const xm = 0.5 * (c - b);
    if (Math.abs(xm) <= tol1 || fb === 0) return { x: b, converged: true };
    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      let s = fb / fa;
      let p, q;
      if (a === c) {
        p = 2 * xm * s;
        q = 1 - s;
      } else {
        const r = fb / fc;
        q = fa / fc;
        p = s * (2 * xm * q * (q - r) - (b - a) * (r - 1));
        q = (q - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q;
      else p = -p;
      if (2 * p < Math.min(3 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))) {
        e = d;
        d = p / q;
      } else {
        d = xm;
        e = xm;
      }
    } else {
      d = xm;
      e = xm;
    }
    a = b;
    fa = fb;
    b += Math.abs(d) > tol1 ? d : xm > 0 ? tol1 : -tol1;
    fb = f(b);
  }
  return { x: b, converged: false };
}
// ---------------------------------------------------------------------------
// 1D linear binning — port of KDEpy's linbin_cython / linbin_numpy
//
// Each data point distributes its weight linearly to the two nearest grid
// points (floor and ceil), proportional to the fractional distance.
// Returns a Float64Array of length gridPoints.length that sums to 1.
// ---------------------------------------------------------------------------
/**
 * Bin scattered data onto a uniform grid using linear (tent) weighting.
 *
 * Rather than placing each data point in a single bucket (histogram-style),
 * each point splits its weight between its two nearest grid neighbours
 * proportionally to how close it is to each.  This avoids the sharp edges
 * of ordinary histograms and is required before FFT-based convolution.
 *
 * @param data       - raw sample values
 * @param gridPoints - uniformly-spaced grid positions (e.g. from autogrid1D)
 * @param weights    - per-sample weights; if omitted, all samples are equal
 * @returns Float64Array of length gridPoints.length that sums to ≈1
 */
export function linearBinning1D(data, gridPoints, weights) {
  const G = gridPoints.length;
  const minGrid = gridPoints[0];
  const maxGrid = gridPoints[G - 1];
  const dx = (maxGrid - minGrid) / (G - 1);
  // Normalised weights
  let w;
  if (weights !== undefined) {
    const wSum = weights.reduce((a, b) => a + b, 0);
    w = weights.map((wi) => wi / wSum);
  } else {
    const uni = 1 / data.length;
    w = new Array(data.length).fill(uni);
  }
  // Extra element absorbs any data point that lands exactly on the upper edge
  const result = new Float64Array(G + 1);
  for (let i = 0; i < data.length; i++) {
    const t = (data[i] - minGrid) / dx;
    const lo = Math.floor(t);
    const frac = t - lo;
    if (lo >= 0 && lo < G) result[lo] += w[i] * (1 - frac);
    if (lo + 1 <= G) result[lo + 1] += w[i] * frac;
  }
  return result.slice(0, G);
}
// ---------------------------------------------------------------------------
// 1D autogrid — port of KDEpy's autogrid for 1D
// ---------------------------------------------------------------------------
/**
 * Build a uniform evaluation grid that spans the data range with padding.
 *
 * The padding prevents the KDE from dropping to zero too abruptly at the
 * edges of the observed data, which would distort bandwidth estimation.
 * The grid size should be a power of 2 for efficient FFT convolution.
 *
 * @param data        - raw sample values (used only to find min/max)
 * @param boundaryAbs - minimum padding in data units on each side (default 3)
 * @param numPoints   - number of grid points; use a power of 2 (default 1024)
 * @param boundaryRel - padding as a fraction of the data range (default 0.05)
 * @returns Float64Array of numPoints evenly-spaced x values
 */
export function autogrid1D(
  data,
  boundaryAbs = 3,
  numPoints = 1024,
  boundaryRel = 0.05,
) {
  let minData = data[0],
    maxData = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < minData) minData = data[i];
    if (data[i] > maxData) maxData = data[i];
  }
  const range = maxData - minData;
  const outside = Math.max(boundaryRel * range, boundaryAbs);
  const lo = minData - outside;
  const hi = maxData + outside;
  const grid = new Float64Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    grid[i] = lo + ((hi - lo) * i) / (numPoints - 1);
  }
  return grid;
}
// ---------------------------------------------------------------------------
// Gaussian kernel (1D)
// K(x, bw) = exp(-x^2 / (2*bw^2)) / (sqrt(2*pi) * bw)
// This is the standard Gaussian PDF with std = bw, matching KDEpy's
// Kernel(gaussian, var=1).evaluate(x, bw, norm=2) in 1D.
// ---------------------------------------------------------------------------
function gaussianKernel1D(x, bw) {
  return Math.exp((-x * x) / (2 * bw * bw)) / (Math.sqrt(2 * Math.PI) * bw);
}
// Find x > 0 where Gaussian kernel drops to atol — matches
// KDEpy's Kernel.practical_support(bw, atol=10e-5) for Gaussian.
// 10e-5 in Python == 1e-4.
function gaussianPracticalSupport(bw, atol = 10e-5) {
  const xtol = 1e-3;
  const result = brentq((x) => gaussianKernel1D(x, bw) - atol, 0, 8 * bw, xtol);
  if (!result.converged) {
    throw new Error('Could not find practical support for Gaussian kernel.');
  }
  return result.x + xtol;
}
// ---------------------------------------------------------------------------
// ISJ fixed-point function — port of KDEpy's _fixed_point
//
// Implements the fixed-point equation t = ξ γ^5(t) from Botev et al. (2010).
// I_sq = [1², 2², ..., (n-1)²]   (length n-1)
// a2   = dct[1:]²                 (length n-1)
// ---------------------------------------------------------------------------
function fixedPoint(t, N, I_sq, a2) {
  const ell = 7; // 5 derivative steps as recommended in the paper
  const piSq = Math.PI * Math.PI;
  // f = 0.5 * π^(2*ell) * Σ_i  I_sq[i]^ell * a2[i] * exp(-I_sq[i] * π² * t)
  let f = 0;
  for (let i = 0; i < I_sq.length; i++) {
    f += Math.pow(I_sq[i], ell) * a2[i] * Math.exp(-I_sq[i] * piSq * t);
  }
  f *= 0.5 * Math.pow(Math.PI, 2 * ell);
  if (f <= 0) return -1;
  // Loop s = ell-1 down to 2  (mirrors Python's reversed(range(2, ell)))
  for (let s = ell - 1; s >= 2; s--) {
    // odd_numbers_prod = 1 * 3 * 5 * ... * (2s-1)  ==  (2s-1)!!
    let oddProd = 1;
    for (let k = 1; k <= 2 * s - 1; k += 2) oddProd *= k;
    const K0 = oddProd / Math.sqrt(2 * Math.PI);
    const constVal = (1 + Math.pow(0.5, s + 0.5)) / 3;
    const time = Math.pow((2 * constVal * K0) / (N * f), 2 / (3 + 2 * s));
    f = 0;
    for (let i = 0; i < I_sq.length; i++) {
      f += Math.pow(I_sq[i], s) * a2[i] * Math.exp(-I_sq[i] * piSq * time);
    }
    f *= 0.5 * Math.pow(Math.PI, 2 * s);
  }
  const tOpt = Math.pow(2 * N * Math.sqrt(Math.PI) * f, -0.4);
  return t - tOpt;
}
// ---------------------------------------------------------------------------
// ISJ root solver — port of KDEpy's _root
// ---------------------------------------------------------------------------
function isjRoot(N, I_sq, a2) {
  const Nc = Math.max(Math.min(1050, N), 50);
  let tol = 10e-12 + (0.01 * (Nc - 50)) / 1000;
  for (;;) {
    const res = brentq((t) => fixedPoint(t, N, I_sq, a2), 0, tol);
    if (res.converged && res.x > 0) return res.x;
    tol *= 2;
    if (tol >= 1)
      throw new Error('ISJ root finding did not converge. Need more data.');
  }
}
// ---------------------------------------------------------------------------
// ISJ bandwidth selection — port of KDEpy's improved_sheather_jones
// ---------------------------------------------------------------------------
/**
 * Data-driven bandwidth selection using the Improved Sheather–Jones (ISJ)
 * plug-in estimator.
 *
 * What is bandwidth?
 * ------------------
 * KDE works by placing a small "bump" (kernel) at each data point and summing
 * them.  The bandwidth controls how wide each bump is — too narrow and the
 * curve is spiky and noisy; too wide and it blurs out real features.  Choosing
 * the right bandwidth automatically is the central problem in KDE.
 *
 * Why ISJ?
 * --------
 * Simpler rules like Silverman's rule assume the data looks roughly Gaussian.
 * ISJ makes no such assumption: it finds the bandwidth that minimises the
 * mean integrated squared error by solving a fixed-point equation derived
 * from the data's own frequency content (via DCT).  This makes it reliable
 * for multimodal or skewed distributions, which are common in performance data.
 *
 * @param data    - raw sample values (at least a few dozen points recommended)
 * @param weights - optional per-sample weights; zero/negative weights are dropped
 * @returns optimal bandwidth in the same units as the data
 */
export function improvedSheatherJones(data, weights) {
  const n = 1024; // 2^10, matching KDEpy
  let d = data;
  let w = weights;
  // Drop zero/negative weights (KDEpy does: data = data[weights > 0])
  if (w !== undefined) {
    const pairs = d.map((v, i) => [v, w[i]]);
    const pos = pairs.filter(([, wi]) => wi > 0);
    d = pos.map(([v]) => v);
    w = pos.map(([, wi]) => wi);
  }
  let minD = d[0],
    maxD = d[0];
  for (let i = 1; i < d.length; i++) {
    if (d[i] < minD) minD = d[i];
    if (d[i] > maxD) maxD = d[i];
  }
  const R = maxD - minD;
  const N = new Set(d).size; // number of unique values
  // ISJ uses boundary_abs=6, boundary_rel=0.5 (wider grid for stable estimation)
  const xmesh = autogrid1D(d, 6, n, 0.5);
  const xmeshArr = Array.from(xmesh);
  const initialData = linearBinning1D(d, xmeshArr, w);
  // Type-2 DCT of the binned data
  const a = dct2(Array.from(initialData));
  // I_sq = [1², 2², ..., (n-1)²]
  const I_sq = new Float64Array(n - 1);
  for (let i = 0; i < n - 1; i++) I_sq[i] = (i + 1) * (i + 1);
  // a2 = a[1:]²  (skip DC component)
  const a2 = new Float64Array(n - 1);
  for (let i = 0; i < n - 1; i++) a2[i] = a[i + 1] * a[i + 1];
  const tStar = isjRoot(N, I_sq, a2);
  return Math.sqrt(tStar) * R;
}
// ---------------------------------------------------------------------------
// Silverman's rule — port of KDEpy's silvermans_rule
// ---------------------------------------------------------------------------
/**
 * Simple rule-of-thumb bandwidth selection (Silverman 1986).
 *
 * Estimates bandwidth as a function of sample size and spread (std / IQR).
 * Fast and robust, but assumes the data is roughly unimodal and bell-shaped.
 * Prefer improvedSheatherJones for multimodal or heavy-tailed distributions.
 *
 * @param data - raw sample values
 * @returns bandwidth estimate in the same units as the data
 */
export function silvermansRule(data) {
  const n = data.length;
  if (n <= 1) return 1;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const variance = data.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1);
  const std = Math.sqrt(variance);
  const sorted = [...data].sort((a, b) => a - b);
  // numpy percentile linear interpolation: index = q * (n-1), interpolate floor/ceil
  function percentile(q) {
    const idx = q * (n - 1);
    const lo = Math.floor(idx),
      hi = Math.ceil(idx);
    return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  }
  // scipy.stats.norm.ppf(.75) - scipy.stats.norm.ppf(.25) = 1.3489795003921634
  const iqr = (percentile(0.75) - percentile(0.25)) / 1.3489795003921634;
  let sigma = Math.min(std, iqr > 0 ? iqr : std);
  if (sigma <= 0) return 1;
  return sigma * Math.pow((n * 3) / 4, -0.2);
}
// ---------------------------------------------------------------------------
// 1D convolution, mode='same' — matches scipy.signal.convolve(a, b, mode='same')
//
// Full convolution c[m] = Σ_k a[k] * b[m-k].
// 'same' returns M elements starting at index (N-1)//2 of the full result,
// where M=len(a), N=len(b).
// ---------------------------------------------------------------------------
function convolve1DSame(a, b) {
  const M = a.length;
  const N = b.length;
  const start = (N - 1) >> 1;
  const result = new Float64Array(M);
  for (let i = 0; i < M; i++) {
    const cIdx = i + start;
    const kMin = Math.max(0, cIdx - (N - 1));
    const kMax = Math.min(M - 1, cIdx);
    let sum = 0;
    for (let k = kMin; k <= kMax; k++) {
      sum += a[k] * b[cIdx - k];
    }
    result[i] = sum;
  }
  return result;
}
/**
 * Kernel Density Estimate using FFT-based convolution (FFTKDE).
 *
 * What is KDE?
 * ------------
 * A KDE turns a set of discrete samples into a smooth continuous curve that
 * estimates the underlying probability density — think of it as a smooth
 * histogram.  Each sample contributes a small Gaussian "bump"; summing all
 * bumps gives the density curve.
 *
 * Why FFT?
 * --------
 * Naively evaluating the sum of N kernels at G grid points costs O(N·G).
 * FFTKDE instead bins the data onto the grid (linearBinning1D) and convolves
 * the binned data with the kernel using FFT, reducing cost to O(G log G)
 * regardless of N.
 *
 * @param data          - raw sample values (at least 2 required)
 * @param bw            - bandwidth: "ISJ" (default, data-driven), "silverman"
 *                        (faster rule of thumb), or a positive number (fixed)
 * @param weights       - optional per-sample weights
 * @param numGridPoints - number of x-axis evaluation points (default 1024)
 * @param boundary      - "none" (default) or "reflection" for data that cannot
 *                        be negative (e.g. latency values): mirrors data at x=0
 *                        so the density doesn't leak below zero
 * @returns { x, y, bandwidth } where x and y are the KDE curve coordinates
 */
export function fftkde(
  data,
  bw = 'ISJ',
  weights,
  numGridPoints = 1024,
  boundary = 'none',
) {
  if (data.length < 2)
    throw new Error('fftkde requires at least 2 data points.');
  if (boundary === 'reflection') {
    return fftkdeReflection(data, bw, weights, numGridPoints);
  }
  // 1. Bandwidth
  let bandwidth;
  if (bw === 'ISJ') {
    bandwidth = improvedSheatherJones(data, weights);
  } else if (bw === 'silverman') {
    bandwidth = silvermansRule(data);
  } else {
    bandwidth = bw;
  }
  return fftkdeCore(data, bandwidth, weights, numGridPoints);
}
function fftkdeCore(data, bandwidth, weights, numGridPoints) {
  // 2. Gaussian practical support — used as boundary_abs for the grid
  const realBw = gaussianPracticalSupport(bandwidth);
  // 3. Evaluation grid — boundary_abs = practical_support(bw), boundary_rel=0.05
  const gridArr = autogrid1D(data, realBw, numGridPoints, 0.05);
  const grid = Array.from(gridArr);
  // 4. Linear binning
  const binnedData = linearBinning1D(data, grid, weights);
  // 5. Grid spacing
  const minGrid = grid[0];
  const maxGrid = grid[numGridPoints - 1];
  const dx = (maxGrid - minGrid) / (numGridPoints - 1);
  // 6. L = number of grid steps for kernel half-width
  const L = Math.min(Math.floor(realBw / dx), numGridPoints);
  // 7. Evaluate kernel on [-L*dx, ..., 0, ..., L*dx]  (2L+1 points)
  const kernelSize = 2 * L + 1;
  const kernelWeights = new Float64Array(kernelSize);
  for (let k = 0; k < kernelSize; k++) {
    kernelWeights[k] = gaussianKernel1D((k - L) * dx, bandwidth);
  }
  // 8. Convolve (mode='same')
  const raw = convolve1DSame(binnedData, kernelWeights);
  // 9. Clamp negatives (floating-point noise)
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] < 0) raw[i] = 0;
  }
  return { x: grid, y: Array.from(raw), bandwidth };
}
// Reflection method for non-negative data.
// Silverman, B. W. (1986). Density Estimation for Statistics and Data
// Analysis. Chapman and Hall, London. Pages 20–22.
// Mirror data at x=0, run KDE on augmented set, take x≥0 and double density.
function fftkdeReflection(data, bw, weights, numGridPoints) {
  // Augment: original + reflection across 0
  const augmented = new Array(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    augmented[i] = data[i];
    augmented[data.length + i] = -data[i];
  }
  // Duplicate weights if provided
  let augWeights;
  if (weights) {
    augWeights = new Array(weights.length * 2);
    for (let i = 0; i < weights.length; i++) {
      augWeights[i] = weights[i];
      augWeights[weights.length + i] = weights[i];
    }
  }
  // Bandwidth from original data (not augmented — augmented is symmetric and
  // would give a wider bandwidth than appropriate for the one-sided distribution)
  let bandwidth;
  if (bw === 'ISJ') {
    bandwidth = improvedSheatherJones(data, weights);
  } else if (bw === 'silverman') {
    bandwidth = silvermansRule(data);
  } else {
    bandwidth = bw;
  }
  // Run KDE on augmented data with double the grid points (we'll discard the left half)
  const result = fftkdeCore(
    augmented,
    bandwidth,
    augWeights,
    numGridPoints * 2,
  );
  // Keep only x ≥ 0, double density (the reflected half integrates to 0.5)
  const x = [];
  const y = [];
  for (let i = 0; i < result.x.length; i++) {
    if (result.x[i] >= 0) {
      x.push(result.x[i]);
      y.push(result.y[i] * 2);
    }
  }
  return { x, y, bandwidth };
}
// ---------------------------------------------------------------------------
// argrelmax — port of scipy.signal.argrelmax(y, order=order)
//
// Returns indices i where y[i] is strictly greater than all y[i±j] for
// j = 1..order.  Boundary points (i < order or i >= N-order) are excluded.
// ---------------------------------------------------------------------------
/**
 * Find indices of local maxima in an array.
 *
 * A point is a local maximum if it is strictly greater than all neighbours
 * within `order` positions on each side.  Larger `order` suppresses narrow
 * noise spikes at the cost of merging closely-spaced genuine peaks.
 *
 * @param y     - array of values (e.g. KDE density at each grid point)
 * @param order - neighbourhood half-width to check (default 1)
 * @returns array of indices where local maxima occur
 */
export function argrelmax(y, order = 1) {
  const N = y.length;
  const peaks = [];
  for (let i = order; i < N - order; i++) {
    let isMax = true;
    for (let j = 1; j <= order; j++) {
      if (y[i] <= y[i - j] || y[i] <= y[i + j]) {
        isMax = false;
        break;
      }
    }
    if (isMax) peaks.push(i);
  }
  return peaks;
}
// ---------------------------------------------------------------------------
// fitKdeModes — port of perf_compare_stats.fit_kde_modes
//
// Runs FFTKDE with ISJ bandwidth, finds local maxima, applies valley-depth
// and data-fraction filters to produce a list of distinct modes.
//
// Parameters
// ----------
// data             : raw sample values
// valleyThreshold  : mode boundary is valid only if valley < threshold * min(peak_heights)
// minPeakFraction  : peak must be >= this fraction of the global max to count
// minDataFraction  : a mode must contain >= this fraction of data to be kept
// ---------------------------------------------------------------------------
/**
 * Detect distinct modes (peaks) in a sample distribution via KDE.
 *
 * Why does this matter for performance data?
 * ------------------------------------------
 * Performance measurements are often multimodal: a benchmark may have a
 * "fast path" (cache warm, branch predicted) and a "slow path" (cache miss,
 * JIT deoptimisation).  A single summary statistic like the mean or median
 * conflates these paths and can hide regressions or improvements.  Finding
 * modes lets us report each code path separately.
 *
 * How it works
 * ------------
 *   1. Fit a KDE to the data (trimmed to 1st–99th percentile for stability).
 *   2. Find local maxima (peaks) in the density curve.
 *   3. Valley-depth filter: two peaks are only counted as separate modes if
 *      the valley between them is deep enough (< valleyThreshold × shorter
 *      peak height).  Shallow saddles are KDE smoothing artefacts.
 *   4. Data-fraction filter: a mode must contain >= minDataFraction of the
 *      actual data points to be reported (avoids noise bumps at the tails).
 *
 * @param data             - raw sample values (fewer than 4 → always 1 mode)
 * @param valleyThreshold  - how deep a valley must be to split two modes;
 *                           0 = never split, 1 = always split (default 0.5)
 * @param minPeakFraction  - minimum peak height as fraction of global max,
 *                           filters tiny noise bumps (default 0.05)
 * @param minDataFraction  - minimum fraction of data a mode must contain
 *                           to be kept (default 0.05)
 * @returns { nModes, peakLocs, boundaries, x, y, bandwidth }
 */
export function fitKdeModes(
  data,
  valleyThreshold = 0.5,
  minPeakFraction = 0.05,
  minDataFraction = 0.05,
) {
  const fallbackX = data.reduce((a, b) => a + b, 0) / data.length;
  function fallback(x, y, bw) {
    const medianVal = [...data].sort((a, b) => a - b)[
      Math.floor(data.length / 2)
    ];
    return {
      nModes: 1,
      peakLocs: [medianVal],
      boundaries: [],
      x,
      y,
      bandwidth: bw,
    };
  }
  if (data.length < 4) {
    return {
      nModes: 1,
      peakLocs: [fallbackX],
      boundaries: [],
      x: [],
      y: [],
      bandwidth: 0,
    };
  }
  // Trim 1st–99th percentile for fitting (matches Python)
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  function pct(q) {
    const idx = q * (n - 1);
    const lo = Math.floor(idx),
      hi = Math.ceil(idx);
    return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  }
  const p1 = pct(0.01),
    p99 = pct(0.99);
  let dataFit = data.filter((v) => v >= p1 && v <= p99);
  if (dataFit.length < 4) dataFit = data;
  let kde;
  try {
    kde = fftkde(dataFit, 'ISJ');
  } catch {
    return fallback([], [], 0);
  }
  const { x, y, bandwidth } = kde;
  // Local maxima with order=3 (matches Python argrelmax order=3)
  let peakIdxs = argrelmax(y, 3);
  const yMax = Math.max(...y);
  peakIdxs = peakIdxs.filter((i) => y[i] >= minPeakFraction * yMax);
  if (peakIdxs.length === 0) {
    const globalMaxIdx = y.indexOf(yMax);
    return {
      nModes: 1,
      peakLocs: [x[globalMaxIdx]],
      boundaries: [],
      x,
      y,
      bandwidth,
    };
  }
  // Valley-depth filter — build `good` list of surviving peak indices
  const good = [peakIdxs[0]];
  for (let k = 1; k < peakIdxs.length; k++) {
    const nxt = peakIdxs[k];
    const prev = good[good.length - 1];
    let valleyMin = y[prev];
    for (let j = prev; j <= nxt; j++) if (y[j] < valleyMin) valleyMin = y[j];
    if (valleyMin < valleyThreshold * Math.min(y[prev], y[nxt])) {
      good.push(nxt);
    } else if (y[nxt] > y[good[good.length - 1]]) {
      good[good.length - 1] = nxt;
    }
  }
  // Compute boundaries (x-position of valley minimum between each adjacent pair)
  function boundaries(peaks) {
    const bs = [];
    for (let i = 0; i < peaks.length - 1; i++) {
      let minIdx = peaks[i];
      for (let j = peaks[i]; j <= peaks[i + 1]; j++)
        if (y[j] < y[minIdx]) minIdx = j;
      bs.push(x[minIdx]);
    }
    return bs;
  }
  // Data-fraction filter: drop modes with < minDataFraction of points
  function assignModes(bounds) {
    return data.map((v) => {
      let m = 0;
      while (m < bounds.length && v > bounds[m]) m++;
      return m;
    });
  }
  const bs0 = boundaries(good);
  const assignments0 = assignModes(bs0);
  const keep = good
    .map((_, i) => i)
    .filter(
      (i) =>
        assignments0.filter((a) => a === i).length / data.length >=
        minDataFraction,
    );
  if (keep.length < 2) {
    const bestIdx = good.reduce((a, b) => (y[a] > y[b] ? a : b));
    return {
      nModes: 1,
      peakLocs: [x[bestIdx]],
      boundaries: [],
      x,
      y,
      bandwidth,
    };
  }
  const finalGood = keep.map((i) => good[i]);
  const finalBounds = boundaries(finalGood);
  return {
    nModes: finalGood.length,
    peakLocs: finalGood.map((i) => x[i]),
    boundaries: finalBounds,
    x,
    y,
    bandwidth,
  };
}
