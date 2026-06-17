/**
 * Type declarations for kde.js.
 *
 * Depends on: nothing (self-contained)
 * Consumed by: example.mjs, kde-widget.js (mode-fitting inlined there)
 */

/**
 * Faithful 1D port of KDEpy's FFTKDE with ISJ bandwidth for a Gaussian kernel.
 *
 * References:
 *   Botev, Z. I., Grotowski, J. F. and Kroese, D. P. (2010):
 *     Kernel density estimation via diffusion. Ann. Stat. 38(5), 2916-2957.
 *   Fan, J. and Marron, J. S. (1994): Fast implementations of nonparametric
 *     curve estimators. J. Comput. Graph. Stat. 3(1), 35-56.
 *   KDEpy: https://github.com/tommyod/KDEpy  (MIT licence)
 */
export declare function dct2(x: number[]): number[];
export declare function linearBinning1D(
  data: number[],
  gridPoints: number[],
  weights?: number[],
): Float64Array;
export declare function autogrid1D(
  data: number[],
  boundaryAbs?: number,
  numPoints?: number,
  boundaryRel?: number,
): Float64Array;
export declare function improvedSheatherJones(
  data: number[],
  weights?: number[],
): number;
export declare function silvermansRule(data: number[]): number;
export type FFTKDEResult = {
  x: number[];
  y: number[];
  bandwidth: number;
};
export declare function fftkde(
  data: number[],
  bw?: number | 'ISJ' | 'silverman',
  weights?: number[],
  numGridPoints?: number,
  boundary?: 'none' | 'reflection',
): FFTKDEResult;
export declare function argrelmax(y: number[], order?: number): number[];
export type KDEModeResult = {
  nModes: number;
  peakLocs: number[];
  boundaries: number[];
  x: number[];
  y: number[];
  bandwidth: number;
};
export declare function fitKdeModes(
  data: number[],
  valleyThreshold?: number,
  minPeakFraction?: number,
  minDataFraction?: number,
): KDEModeResult;
export type FitModesFromKdeResult = {
  peakLocs: number[];
  boundaries: number[];
};
export declare function fitModesFromKde(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  vt: number,
  mpf?: number,
  mdf?: number,
): FitModesFromKdeResult;
export declare function areaFracs(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  boundaries: number[],
): number[];
export declare function assignLetters(locs: number[]): string[];
export type MatchModesResult = {
  pairs: Array<[number, number]>;
  ub: number[];
  un: number[];
};
export declare function matchModes(
  bLocs: number[],
  bFracs: number[],
  nLocs: number[],
  nFracs: number[],
): MatchModesResult;
export declare function splitByMode(
  data: number[],
  boundaries: number[],
): number[][];
