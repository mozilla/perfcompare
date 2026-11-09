// A fake, in-browser Treeherder backend.
//
// When the URL contains the `fakedata` parameter, every request that would
// normally go to Treeherder (see fetchFromTreeherder in ./treeherder.ts) is
// answered by this module instead. It returns responses with the same shape as
// the real API, so the real loaders, table, filters, sorting and graphs run
// unchanged on top of it.
//
// The data is generated, but in a way that tries to look like production:
// - several frameworks (talos, browsertime, awsy, devtools, build_metrics),
//   each with realistic suites, units and noise levels;
// - every test runs on several platforms, and many have subtests;
// - runs are made of per-job replicates, with job-to-job variance, outliers and
//   some bimodal tests, so that the distribution graphs look like real ones;
// - each new revision has its own "personality" (mostly regressions, mostly
//   improvements, mostly noise) so switching revisions shows different results;
// - the statistics (t-test, Mann-Whitney U, Cliff's delta, CLES,
//   Shapiro-Wilk, KS) are actually computed from the generated values.
//
// Everything is seeded from the request parameters, so a given URL always
// produces exactly the same data.

import { fakeDefaultComparison } from './fakeTreeherderDefaults';
import { repoMap } from '../common/constants';
import type {
  BasicStatItem,
  Changeset,
  CompareResultsItem,
  MannWhitneyResultsItem,
  Repository,
  StatisticsTestItem,
} from '../types/state';
import type {
  ConfidenceText,
  Framework,
  MeasurementUnit,
  Platform,
} from '../types/types';
import { shapiroWilkTest } from '../utils/shapiroWilk';

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

// FNV-1a: turns any string into a 32-bit seed.
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// Mulberry32: a tiny, fast, seedable PRNG returning floats in [0, 1).
function createRandom(seedSource: string) {
  let seed = hashString(seedSource);
  const newSide = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    // Box-Muller
    const u = 1 - newSide();
    const v = newSide();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const int = (min: number, max: number) =>
    min + Math.floor(newSide() * (max - min + 1));
  const pick = <T>(values: readonly T[]): T =>
    values[int(0, values.length - 1)];
  return { newSide, normal, int, pick };
}

type Random = ReturnType<typeof createRandom>;

function fakeHash(seedSource: string): string {
  const random = createRandom(seedSource);
  let hash = '';
  for (let i = 0; i < 40; i++) {
    hash += Math.floor(random.newSide() * 16).toString(16);
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Test catalog
// ---------------------------------------------------------------------------

type PlatformGroup = 'desktop' | 'desktop+android' | 'android';

type TestDefinition = {
  suite: string;
  test: string;
  unit: MeasurementUnit;
  lowerIsBetter: boolean;
  // Typical value on the reference platform.
  value: number;
  // Coefficient of variation of a single replicate.
  noise: number;
  // Number of replicates per job. 1 means the test has no replicates.
  replicates: number;
  // Some tests are known to have two modes.
  bimodal?: boolean;
  subtests?: string[];
  platforms?: PlatformGroup;
};

type FrameworkDefinition = {
  app: string;
  extraOptions: string;
  tests: TestDefinition[];
};

const desktopPlatforms: Platform[] = [
  'linux1804-64-shippable-qr',
  'macosx1015-64-shippable-qr',
  'windows10-64-shippable-qr',
  'windows11-64-2009-qr',
];
const androidPlatforms: Platform[] = [
  'android-hw-a51-11-0-aarch64-shippable-qr',
];

// Platforms are not equally fast.
const platformSpeedFactor: Partial<Record<Platform, number>> = {
  'linux1804-64-shippable-qr': 1,
  'macosx1015-64-shippable-qr': 0.85,
  'windows10-64-shippable-qr': 1.15,
  'windows11-64-2009-qr': 1.05,
  'android-hw-a51-11-0-aarch64-shippable-qr': 2.6,
};

function platformsFor(group: PlatformGroup = 'desktop'): Platform[] {
  switch (group) {
    case 'android':
      return androidPlatforms;
    case 'desktop+android':
      return [...desktopPlatforms, ...androidPlatforms];
    default:
      return desktopPlatforms;
  }
}

const pageloadMetrics = [
  'fcp',
  'loadtime',
  'largestContentfulPaint',
  'SpeedIndex',
  'ContentfulSpeedIndex',
  'LastVisualChange',
];

const catalog: Partial<Record<Framework['id'], FrameworkDefinition>> = {
  1: {
    app: '',
    extraOptions: 'e10s fission stylo webrender',
    tests: [
      {
        suite: 'a11yr',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 410,
        noise: 0.025,
        replicates: 25,
        subtests: ['dhtml.html', 'tablemutation.html'],
      },
      {
        suite: 'tp5o',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 182,
        noise: 0.05,
        replicates: 25,
        subtests: [
          'amazon.com',
          'bbc.co.uk',
          'cnn.com',
          'ebay.com',
          'imdb.com',
          'wikipedia.org',
          'youtube.com',
        ],
      },
      {
        suite: 'tsvgx',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 96,
        noise: 0.04,
        replicates: 25,
        subtests: [
          'composite-scale.svg',
          'composite-scale-opacity.svg',
          'gearflowers.svg',
          'hixie-001.xml',
          'hixie-007.xml',
        ],
      },
      {
        suite: 'tart',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 3.4,
        noise: 0.07,
        replicates: 25,
        subtests: [
          'icon-close-DPIcurrent.half.TART',
          'simple-open-DPIcurrent.all.TART',
          'newtab-open-preload-yes.all.TART',
        ],
      },
      {
        suite: 'perf_reftest_singletons',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 1.8,
        noise: 0.08,
        replicates: 25,
        subtests: [
          'bloom-basic.html',
          'display-none-1.html',
          'style-sharing.html',
          'tiny-traversal-singleton.html',
          'abspos-reflow-1.html',
        ],
      },
      {
        suite: 'ts_paint',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 320,
        noise: 0.03,
        replicates: 20,
      },
      {
        suite: 'sessionrestore',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 265,
        noise: 0.04,
        replicates: 10,
      },
      {
        suite: 'glterrain',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 1.9,
        noise: 0.05,
        replicates: 25,
        bimodal: true,
      },
      {
        suite: 'tresize',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 8.6,
        noise: 0.06,
        replicates: 20,
      },
      {
        suite: 'startup_about_home_paint',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 640,
        noise: 0.035,
        replicates: 20,
      },
    ],
  },
  13: {
    app: 'firefox',
    extraOptions: 'cold fission webrender',
    tests: [
      {
        suite: 'speedometer3',
        test: 'score',
        unit: 'score',
        lowerIsBetter: false,
        value: 24.5,
        noise: 0.015,
        replicates: 5,
        platforms: 'desktop+android',
        subtests: [
          'TodoMVC-React-Complex-DOM',
          'TodoMVC-Vue',
          'Editor-CodeMirror',
          'Charts-chartjs',
          'NewsSite-newSide',
          'React-Stockcharts-SVG',
          'Perf-Dashboard',
        ],
      },
      {
        suite: 'jetstream2',
        test: 'score',
        unit: 'score',
        lowerIsBetter: false,
        value: 185,
        noise: 0.02,
        replicates: 3,
      },
      {
        suite: 'motionmark-htmlsuite',
        test: 'score',
        unit: 'score',
        lowerIsBetter: false,
        value: 640,
        noise: 0.05,
        replicates: 5,
        bimodal: true,
      },
      {
        suite: 'amazon',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 520,
        noise: 0.08,
        replicates: 15,
        platforms: 'desktop+android',
        subtests: pageloadMetrics,
      },
      {
        suite: 'google-search',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 310,
        noise: 0.07,
        replicates: 15,
        platforms: 'desktop+android',
        subtests: pageloadMetrics,
      },
      {
        suite: 'youtube',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 880,
        noise: 0.09,
        replicates: 15,
        bimodal: true,
        subtests: pageloadMetrics,
      },
      {
        suite: 'wikipedia',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 240,
        noise: 0.06,
        replicates: 15,
        subtests: pageloadMetrics,
      },
      {
        suite: 'reddit',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 690,
        noise: 0.1,
        replicates: 15,
        subtests: pageloadMetrics,
      },
      {
        suite: 'matrix-react-bench',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 132,
        noise: 0.04,
        replicates: 10,
      },
      {
        suite: 'startup',
        test: 'newssite-applink-startup',
        unit: 'ms',
        lowerIsBetter: true,
        value: 1450,
        noise: 0.05,
        replicates: 10,
        platforms: 'android',
      },
    ],
  },
  4: {
    app: '',
    extraOptions: 'e10s fission stylo webrender',
    tests: [
      {
        suite: 'Base Content Explicit',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 8_400_000,
        noise: 0.004,
        replicates: 1,
      },
      {
        suite: 'Base Content Heap Unclassified',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 1_250_000,
        noise: 0.01,
        replicates: 1,
      },
      {
        suite: 'Base Content JS',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 1_620_000,
        noise: 0.002,
        replicates: 1,
      },
      {
        suite: 'Base Content Resident Unique Memory',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 14_500_000,
        noise: 0.006,
        replicates: 1,
      },
      {
        suite: 'Explicit Memory',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 520_000_000,
        noise: 0.02,
        replicates: 1,
        subtests: ['Fresh start', 'Tabs open', 'Tabs closed', 'After GC'],
      },
      {
        suite: 'Heap Unclassified',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 68_000_000,
        noise: 0.03,
        replicates: 1,
      },
      {
        suite: 'Images',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 5_100_000,
        noise: 0.08,
        replicates: 1,
        bimodal: true,
      },
      {
        suite: 'Resident Memory',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 1_050_000_000,
        noise: 0.015,
        replicates: 1,
        subtests: ['Fresh start', 'Tabs open', 'Tabs closed', 'After GC'],
      },
    ],
  },
  12: {
    app: '',
    extraOptions: 'e10s fission stylo webrender',
    tests: [
      {
        suite: 'damp',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 260,
        noise: 0.03,
        replicates: 25,
        subtests: [
          'custom.inspector.open.DAMP',
          'custom.inspector.reload.DAMP',
          'custom.netmonitor.reload.DAMP',
          'custom.webconsole.reload.DAMP',
          'simple.webconsole.open.DAMP',
          'simple.debugger.open.DAMP',
          'browser-toolbox.open-and-close.DAMP',
        ],
      },
      {
        suite: 'damp',
        test: 'inspector-metrics',
        unit: 'ms',
        lowerIsBetter: true,
        value: 41,
        noise: 0.05,
        replicates: 25,
      },
    ],
  },
  2: {
    app: '',
    extraOptions: '',
    tests: [
      {
        suite: 'installer size',
        test: '',
        unit: 'bytes',
        lowerIsBetter: true,
        value: 82_000_000,
        noise: 0.0002,
        replicates: 1,
        platforms: 'desktop+android',
      },
      {
        suite: 'compiler warnings',
        test: '',
        unit: null,
        lowerIsBetter: true,
        value: 18,
        noise: 0,
        replicates: 1,
      },
      {
        suite: 'build times',
        test: '',
        unit: 'ms',
        lowerIsBetter: true,
        value: 1_380_000,
        noise: 0.03,
        replicates: 1,
      },
    ],
  },
};

function genericFramework(frameworkId: Framework['id']): FrameworkDefinition {
  return {
    app: '',
    extraOptions: '',
    tests: ['benchmark-a', 'benchmark-b', 'benchmark-c'].map((suite) => ({
      suite: `${suite}-${frameworkId}`,
      test: '',
      unit: 'ms' as const,
      lowerIsBetter: true,
      value: 200,
      noise: 0.04,
      replicates: 10,
    })),
  };
}

function getFramework(frameworkId: Framework['id']): FrameworkDefinition {
  return catalog[frameworkId] ?? genericFramework(frameworkId);
}

// Signature ids are stable for a given framework / test / platform, exactly
// like in Treeherder, so that subtests requests can find their parent.
function signatureId(...parts: Array<string | number>): number {
  return 100000 + (hashString(parts.join('|')) % 4900000);
}

function parentSignatureFor(
  frameworkId: Framework['id'],
  test: TestDefinition,
  platform: Platform,
) {
  return signatureId(frameworkId, test.suite, test.test, platform);
}

function findParent(frameworkId: Framework['id'], parentSignature: number) {
  for (const test of getFramework(frameworkId).tests) {
    for (const platform of platformsFor(test.platforms)) {
      if (parentSignatureFor(frameworkId, test, platform) === parentSignature) {
        return { test, platform };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Change scenarios
// ---------------------------------------------------------------------------

type Scenario =
  | 'none'
  | 'small-regression'
  | 'large-regression'
  | 'small-improvement'
  | 'large-improvement'
  | 'noisy';

// Each new revision gets a personality, so that switching between revisions in
// the results page shows different pictures.
const personalities: Array<Array<[Scenario, number]>> = [
  // Mostly regressions
  [
    ['none', 50],
    ['small-regression', 18],
    ['large-regression', 10],
    ['small-improvement', 8],
    ['large-improvement', 2],
    ['noisy', 12],
  ],
  // Mostly improvements
  [
    ['none', 50],
    ['small-regression', 6],
    ['large-regression', 2],
    ['small-improvement', 20],
    ['large-improvement', 10],
    ['noisy', 12],
  ],
  // Mostly noise
  [
    ['none', 70],
    ['small-regression', 6],
    ['large-regression', 2],
    ['small-improvement', 6],
    ['large-improvement', 2],
    ['noisy', 14],
  ],
];

function pickScenario(random: Random, newRev: string): Scenario {
  const knownIndex = fakeDefaultComparison.newRevs.indexOf(newRev);
  const index =
    knownIndex >= 0 ? knownIndex : hashString(newRev) % personalities.length;
  const weights = personalities[index % personalities.length];
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random.newSide() * total;
  for (const [scenario, weight] of weights) {
    roll -= weight;
    if (roll < 0) return scenario;
  }
  return 'none';
}

// Returns the relative change of the "goodness" of the result: a positive
// value is an improvement, a negative one is a regression.
function scenarioChange(random: Random, scenario: Scenario): number {
  const between = (min: number, max: number) =>
    min + random.newSide() * (max - min);
  switch (scenario) {
    case 'small-regression':
      return -between(0.015, 0.04);
    case 'large-regression':
      return -between(0.06, 0.2);
    case 'small-improvement':
      return between(0.015, 0.04);
    case 'large-improvement':
      return between(0.06, 0.18);
    case 'noisy':
      return between(-0.01, 0.01);
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Value generation
// ---------------------------------------------------------------------------

type GeneratedSide = { runs: number[]; replicates: number[] };

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function generateSide(
  random: Random,
  {
    jobs,
    replicatesPerJob,
    center,
    noise,
    bimodal,
    integer,
  }: {
    jobs: number;
    replicatesPerJob: number;
    center: number;
    noise: number;
    bimodal: boolean;
    integer: boolean;
  },
): GeneratedSide {
  const runs: number[] = [];
  const replicates: number[] = [];
  const digits = center >= 1000 ? 0 : center >= 10 ? 2 : 3;
  const modeGap = 0.08 + random.newSide() * 0.07;
  for (let job = 0; job < jobs; job++) {
    // Each job runs on a different machine, which adds a bit of variance.
    const jobFactor = 1 + random.normal() * noise * 0.2;
    const jobValues: number[] = [];
    for (let i = 0; i < replicatesPerJob; i++) {
      let value = center * jobFactor * Math.exp(random.normal() * noise);
      if (bimodal && random.newSide() < 0.3) value *= 1 + modeGap;
      if (random.newSide() < 0.02) value *= 1 + 0.2 + random.newSide() * 0.4;
      value = integer ? Math.round(value) : round(value, digits);
      jobValues.push(value);
    }
    replicates.push(...jobValues);
    const jobRun = median(jobValues);
    runs.push(integer ? Math.round(jobRun) : round(jobRun, digits));
  }
  return { runs, replicates: replicatesPerJob > 1 ? replicates : [] };
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

function mean(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function variance(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return (
    values.reduce((sum, value) => sum + (value - m) ** 2, 0) /
    (values.length - 1)
  );
}

function stddevPct({ mean, stddev }: BasicStatItem): number {
  return mean && stddev ? round((stddev / mean) * 100) : 0;
}

function standardStats(values: number[]): BasicStatItem {
  const m = mean(values);
  const v = variance(values);
  const stddev = Math.sqrt(v);
  return {
    mean: round(m),
    median: round(median(values)),
    stddev: round(stddev),
    variance: round(v),
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
  };
}

// Standard normal cumulative distribution function (Abramowitz & Stegun 26.2.17).
function normalCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Mann-Whitney U with tie correction and normal approximation.
// Returns U for "base > new" (ties count for half) and the two-sided p-value.
function mannWhitney(base: number[], newSide: number[]) {
  const n1 = base.length;
  const n2 = newSide.length;
  const combined = [
    ...base.map((value) => ({ value, isBase: true })),
    ...newSide.map((value) => ({ value, isBase: false })),
  ].sort((a, b) => a.value - b.value);

  let rankSumBase = 0;
  let tieTerm = 0;
  for (let i = 0; i < combined.length; ) {
    let j = i;
    while (
      j + 1 < combined.length &&
      combined[j + 1].value === combined[i].value
    )
      j++;
    const rank = (i + j) / 2 + 1;
    const tieCount = j - i + 1;
    tieTerm += tieCount ** 3 - tieCount;
    for (let k = i; k <= j; k++) {
      if (combined[k].isBase) rankSumBase += rank;
    }
    i = j + 1;
  }

  const uBase = rankSumBase - (n1 * (n1 + 1)) / 2;
  const n = n1 + n2;
  const meanU = (n1 * n2) / 2;
  const sigma = Math.sqrt(
    ((n1 * n2) / 12) * (n + 1 - tieTerm / (n * (n - 1) || 1)),
  );
  const z = sigma ? (Math.abs(uBase - meanU) - 0.5) / sigma : 0;
  const pvalue = Math.min(1, 2 * (1 - normalCdf(Math.max(z, 0))));
  return { uBase, pvalue };
}

// One-sample Kolmogorov-Smirnov against a normal distribution fitted to the
// data, used as a goodness-of-fit check like the real backend does.
function ksGoodnessOfFit(values: number[]) {
  const n = values.length;
  const m = mean(values);
  const sd = Math.sqrt(variance(values));
  if (n < 3 || !sd) return null;
  const sorted = [...values].sort((a, b) => a - b);
  let d = 0;
  sorted.forEach((value, i) => {
    const cdf = normalCdf((value - m) / sd);
    d = Math.max(d, Math.abs(cdf - i / n), Math.abs((i + 1) / n - cdf));
  });
  const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * d;
  let pvalue = 0;
  for (let k = 1; k <= 100; k++) {
    pvalue += 2 * (-1) ** (k - 1) * Math.exp(-2 * k * k * lambda * lambda);
  }
  return {
    stat: round(d, 4),
    pvalue: round(Math.min(Math.max(pvalue, 0), 1), 4),
  };
}

function cliffsInterpretation(delta: number) {
  const absolute = Math.abs(delta);
  if (absolute < 0.147) return 'negligible';
  if (absolute < 0.33) return 'small';
  if (absolute < 0.474) return 'moderate';
  return 'large';
}

function shapiroWilkItem(
  values: number[],
  label: 'Base' | 'New',
  warnings: string[],
): StatisticsTestItem {
  const result = shapiroWilkTest(values);
  if (!result) {
    return {
      pvalue: null,
      interpretation: 'Not enough data for normality test.',
    };
  }
  const isNormal = result.pvalue > 0.05;
  if (!isNormal) {
    warnings.push(
      `${label} is not normally distributed (Shapiro-Wilk p-value: ${result.pvalue.toFixed(3)}).`,
    );
  }
  return {
    pvalue: round(result.pvalue, 4),
    interpretation: isNormal
      ? `${label} is likely normal`
      : `${label} is likely not normal`,
  };
}

// ---------------------------------------------------------------------------
// Result items
// ---------------------------------------------------------------------------

type ResultsRequest = {
  baseRev: string;
  baseRepo: Repository['name'];
  newRev: string;
  newRepo: Repository['name'];
  frameworkId: Framework['id'];
  replicates: boolean;
  testVersion: string;
  parentSignature: number | null;
};

type RowDefinition = {
  test: TestDefinition;
  platform: Platform;
  // Name of the subtest when this row is a subtest.
  subtest: string | null;
  baseSignature: number;
  newSignature: number;
  parentSignature: number | null;
  hasSubtests: boolean;
};

function rowsForRequest(request: ResultsRequest): RowDefinition[] {
  const { frameworkId, parentSignature } = request;
  if (parentSignature !== null) {
    const parent = findParent(frameworkId, parentSignature);
    if (!parent?.test.subtests) return [];
    return parent.test.subtests.map((subtest) => {
      const id = signatureId(parentSignature, subtest);
      return {
        test: parent.test,
        platform: parent.platform,
        subtest,
        baseSignature: id,
        newSignature: id,
        parentSignature,
        hasSubtests: false,
      };
    });
  }

  return getFramework(frameworkId).tests.flatMap((test) =>
    platformsFor(test.platforms).map((platform) => {
      const id = parentSignatureFor(frameworkId, test, platform);
      return {
        test,
        platform,
        subtest: null,
        baseSignature: id,
        newSignature: id,
        parentSignature: null,
        hasSubtests: Boolean(test.subtests?.length),
      };
    }),
  );
}

function graphsLink(request: ResultsRequest, row: RowDefinition) {
  const params = new URLSearchParams();
  params.append('highlightedRevisions', request.baseRev.slice(0, 12));
  params.append('highlightedRevisions', request.newRev.slice(0, 12));
  params.append(
    'series',
    `${request.baseRepo},${row.baseSignature},1,${request.frameworkId}`,
  );
  if (request.newRepo !== request.baseRepo) {
    params.append(
      'series',
      `${request.newRepo},${row.newSignature},1,${request.frameworkId}`,
    );
  }
  params.append('timerange', '1209600');
  return `https://treeherder.mozilla.org/perfherder/graphs?${params.toString()}`;
}

function generateResult(
  request: ResultsRequest,
  row: RowDefinition,
): CompareResultsItem | MannWhitneyResultsItem {
  const { test, platform, subtest } = row;
  const framework = getFramework(request.frameworkId);
  const isAndroid = platform.startsWith('android');
  const app = framework.app && isAndroid ? 'fenix' : framework.app;

  // The base values only depend on the base revision, so that the same base
  // is consistent across new revisions.
  const baseRandom = createRandom(
    `base|${request.baseRev}|${row.baseSignature}`,
  );
  const newRandom = createRandom(
    `new|${request.baseRev}|${request.newRev}|${row.newSignature}`,
  );

  // Each subtest has its own typical value around the parent's value.
  const subtestFactor = subtest
    ? 0.3 + createRandom(`subtest|${subtest}`).newSide() * 1.6
    : 1;
  const center =
    test.value * (platformSpeedFactor[platform] ?? 1) * subtestFactor;
  const noise = test.noise * (isAndroid ? 1.6 : 1);
  const integer = test.unit === 'bytes' || test.unit === null;

  // Occasionally the new revision has fewer jobs, or none at all yet.
  const jobsBase = baseRandom.int(4, 8);
  const missingNew = newRandom.newSide() < 0.02;
  const jobsNew = missingNew
    ? 0
    : newRandom.newSide() < 0.12
      ? newRandom.int(2, 3)
      : newRandom.int(4, 8);

  const sameRevision =
    request.baseRev === request.newRev && request.baseRepo === request.newRepo;
  const scenario = sameRevision
    ? 'none'
    : pickScenario(newRandom, request.newRev);
  const goodnessChange = scenarioChange(newRandom, scenario);
  const valueChange = test.lowerIsBetter ? -goodnessChange : goodnessChange;
  const newNoise = scenario === 'noisy' ? noise * 2.2 : noise;

  const base = generateSide(baseRandom, {
    jobs: jobsBase,
    replicatesPerJob: test.replicates,
    center,
    noise,
    bimodal: Boolean(test.bimodal),
    integer,
  });
  const newSide = generateSide(newRandom, {
    jobs: jobsNew,
    replicatesPerJob: test.replicates,
    center: center * (1 + valueChange),
    noise: newNoise,
    bimodal: Boolean(test.bimodal),
    integer,
  });

  const useReplicates = request.replicates && test.replicates > 1;
  const baseSample = useReplicates ? base.replicates : base.runs;
  const newSample = useReplicates ? newSide.replicates : newSide.runs;
  const baseRunsReplicates = request.replicates ? base.replicates : [];
  const newRunsReplicates = request.replicates ? newSide.replicates : [];

  const baseMean = mean(baseSample);
  const newMean = mean(newSample);
  const deltaValue = newSample.length ? newMean - baseMean : 0;
  const deltaPercentage = baseMean ? (deltaValue / baseMean) * 100 : 0;
  const newIsBetter = test.lowerIsBetter ? deltaValue < 0 : deltaValue > 0;
  const moreRunsAreNeeded = base.runs.length < 5 || newSide.runs.length < 5;

  const headerName = [
    test.suite,
    subtest ?? test.test,
    'opt',
    framework.extraOptions,
  ]
    .filter(Boolean)
    .join(' ');

  const common = {
    base_rev: request.baseRev,
    new_rev: request.newRev,
    base_app: app,
    new_app: app,
    header_name: headerName,
    base_retriggerable_job_ids: base.runs.map(
      (_, i) => 480000000 + (hashString(`${row.baseSignature}|${i}`) % 9000000),
    ),
    new_retriggerable_job_ids: newSide.runs.map(
      (_, i) =>
        490000000 +
        (hashString(`${request.newRev}|${row.newSignature}|${i}`) % 9000000),
    ),
    base_measurement_unit: test.unit,
    new_measurement_unit: test.unit,
    platform,
    suite: test.suite,
    framework_id: request.frameworkId,
    new_repository_name: request.newRepo,
    base_repository_name: request.baseRepo,
    base_runs: base.runs,
    new_runs: newSide.runs,
    base_runs_replicates: baseRunsReplicates,
    new_runs_replicates: newRunsReplicates,
    lower_is_better: test.lowerIsBetter,
    test: subtest ?? test.test,
    option_name: 'opt',
    extra_options: framework.extraOptions,
    graphs_link: graphsLink(request, row),
    base_parent_signature: row.parentSignature,
    new_parent_signature: row.parentSignature,
    base_signature_id: row.baseSignature,
    new_signature_id: row.newSignature,
    has_subtests: row.hasSubtests,
  };

  if (request.testVersion === 'mann-whitney-u') {
    return mannWhitneyResult(common, baseSample, newSample, test.lowerIsBetter);
  }
  return studentTResult(
    {
      ...common,
      is_complete: base.runs.length > 0 && newSide.runs.length > 0,
      delta_value: round(deltaValue),
      delta_percentage: round(deltaPercentage),
      new_is_better: newIsBetter,
      more_runs_are_needed: moreRunsAreNeeded,
    },
    baseSample,
    newSample,
    test.lowerIsBetter,
  );
}

type CommonFields = Omit<
  CompareResultsItem,
  | 'base_avg_value'
  | 'new_avg_value'
  | 'base_median_value'
  | 'new_median_value'
  | 'base_stddev'
  | 'new_stddev'
  | 'base_stddev_pct'
  | 'new_stddev_pct'
  | 'confidence'
  | 'confidence_text'
  | 'magnitude'
  | 'is_improvement'
  | 'noise_metric'
  | 'is_confident'
  | 'is_regression'
  | 'is_meaningful'
>;

// The real API only returns these for Student-T, so Mann-Whitney results don't
// get them.
type SharedFields = Omit<
  CommonFields,
  | 'is_complete'
  | 'delta_value'
  | 'delta_percentage'
  | 'new_is_better'
  | 'more_runs_are_needed'
>;

function studentTResult(
  common: CommonFields,
  baseSample: number[],
  newSample: number[],
  lowerIsBetter: boolean,
): CompareResultsItem {
  const baseStats = standardStats(baseSample);
  const newStats = standardStats(newSample);

  let confidence: number | null = null;
  let confidenceText: ConfidenceText = '';
  if (baseSample.length >= 2 && newSample.length >= 2) {
    const standardError = Math.sqrt(
      variance(baseSample) / baseSample.length +
        variance(newSample) / newSample.length,
    );
    confidence = standardError
      ? round(Math.abs(mean(newSample) - mean(baseSample)) / standardError)
      : 0;
    confidenceText =
      confidence < 3 ? 'Low' : confidence < 5 ? 'Medium' : 'High';
  }

  const isMeaningful = Math.abs(common.delta_percentage) >= 2;
  const isConfident = confidence !== null && confidence >= 3;
  const newIsBetter = lowerIsBetter
    ? common.delta_value < 0
    : common.delta_value > 0;

  return {
    ...common,
    base_avg_value: baseStats.mean ?? 0,
    new_avg_value: newStats.mean ?? 0,
    base_median_value: baseStats.median ?? 0,
    new_median_value: newStats.median ?? 0,
    base_stddev: baseStats.stddev ?? 0,
    new_stddev: newStats.stddev ?? 0,
    base_stddev_pct: stddevPct(baseStats),
    new_stddev_pct: stddevPct(newStats),
    confidence,
    confidence_text: confidenceText,
    magnitude: round(
      Math.min((Math.abs(common.delta_percentage) / 20) * 100, 100),
    ),
    noise_metric: false,
    is_confident: confidence !== null && confidence >= 5,
    is_meaningful: isMeaningful,
    is_improvement: isMeaningful && isConfident && newIsBetter,
    is_regression: isMeaningful && isConfident && !newIsBetter,
  };
}

function mannWhitneyResult(
  common: SharedFields,
  baseSample: number[],
  newSample: number[],
  lowerIsBetter: boolean,
): MannWhitneyResultsItem {
  const shapiroWilkWarnings: string[] = [];
  const shapiroBase = shapiroWilkItem(baseSample, 'Base', shapiroWilkWarnings);
  const shapiroNew = shapiroWilkItem(newSample, 'New', shapiroWilkWarnings);

  const hasData = baseSample.length > 0 && newSample.length > 0;
  const { uBase, pvalue } = hasData
    ? mannWhitney(baseSample, newSample)
    : { uBase: 0, pvalue: 1 };
  const pairs = baseSample.length * newSample.length || 1;
  // P(base > new): the chance that a New value is lower than a Base value.
  const cles = hasData ? uBase / pairs : 0.5;
  const cliffsDelta = hasData ? 2 * cles - 1 : 0;
  const interpretation = cliffsInterpretation(cliffsDelta);
  const isSignificant = hasData && pvalue < 0.05;

  const medianDelta = median(newSample) - median(baseSample);
  const newIsBetter = lowerIsBetter ? medianDelta < 0 : medianDelta > 0;
  const direction: MannWhitneyResultsItem['direction_of_change'] =
    !hasData || interpretation === 'negligible'
      ? 'no change'
      : newIsBetter
        ? 'improvement'
        : 'regression';

  const ks = ksGoodnessOfFit(baseSample);
  const ksTest: StatisticsTestItem = ks
    ? {
        pvalue: ks.pvalue,
        interpretation: `KS test p-value: ${ks.pvalue.toFixed(3)}, ${
          ks.pvalue > 0.05 ? 'good fit' : 'poor fit'
        }`,
      }
    : null;

  const clesPercent = Math.round(cles * 100);
  const lowerOrHigher = cles >= 0.5 ? 'lower' : 'higher';
  const chance = cles >= 0.5 ? clesPercent : 100 - clesPercent;

  return {
    ...common,
    base_standard_stats: standardStats(baseSample),
    new_standard_stats: standardStats(newSample),
    ks_test: ksTest,
    ks_warning:
      ks && ks.pvalue <= 0.05
        ? `The KDE fit of Base is poor (KS test p-value: ${ks.pvalue.toFixed(3)}), the distribution may be multimodal.`
        : null,
    shapiro_wilk_test_base: shapiroBase,
    shapiro_wilk_test_new: shapiroNew,
    shapiro_wilk_warnings: shapiroWilkWarnings,
    mann_whitney_test: {
      pvalue: round(pvalue, 4),
      interpretation: isSignificant ? 'significant' : 'not significant',
    },
    cliffs_delta: round(cliffsDelta),
    cliffs_interpretation: interpretation,
    cles: {
      cles: round(cles),
      cles_direction: `New is ${lowerOrHigher} than Base`,
      mann_whitney_u_cles: `${chance}% chance a New value is ${lowerOrHigher} than a Base value`,
    },
    direction_of_change: direction,
    base_avg_value: round(mean(baseSample)),
    new_avg_value: round(mean(newSample)),
    base_median_value: round(median(baseSample)),
    new_median_value: round(median(newSample)),
  };
}

function generateResults(request: ResultsRequest) {
  return rowsForRequest(request).map((row) => generateResult(request, row));
}

// ---------------------------------------------------------------------------
// Revisions / pushes
// ---------------------------------------------------------------------------

const authors = [
  'jdoe@mozilla.com',
  'asmith@mozilla.com',
  'mchen@mozilla.com',
  'rpatel@mozilla.com',
  'lgarcia@mozilla.com',
  'kwilliams@mozilla.com',
];

const commitMessages = [
  'Bug 1934567 - Avoid a redundant style flush when restoring tabs. r=emilio',
  'Bug 1928810 - Cache compiled shaders across WebRender restarts. r=gw',
  'Bug 1931204 - Lazily initialize the URL classifier on startup. r=dimi',
  'Bug 1926653 - Reduce allocations in the JIT baseline compiler. r=jandem',
  'Bug 1935021 - Use a smaller arena for DOM text nodes. r=smaug',
  'Bug 1929947 - Batch IPC messages for network priority updates. r=necko-reviewers',
  'Bug 1932388 - Skip layout of hidden iframes during page load. r=dholbert',
  'Bug 1927745 - Speed up CSS selector matching for :has(). r=emilio',
];

// Hand-written details for the default revisions, so the header of the
// results page looks like a real comparison.
const knownRevisions: Record<string, { author: string; message: string }> = {
  [fakeDefaultComparison.baseRev]: {
    author: 'sheriff@mozilla.com',
    message: 'Merge autoland to mozilla-central. a=merge',
  },
  [fakeDefaultComparison.newRevs[0]]: {
    author: 'jdoe@mozilla.com',
    message:
      'Bug 1934567 - Prefetch style sheets during session restore. r=emilio',
  },
  [fakeDefaultComparison.newRevs[1]]: {
    author: 'mchen@mozilla.com',
    message:
      'Bug 1926653 - Reduce allocations in the JIT baseline compiler. r=jandem',
  },
  [fakeDefaultComparison.newRevs[2]]: {
    author: 'asmith@mozilla.com',
    message:
      'Bug 1928810 - Cache compiled shaders across WebRender restarts. r=gw',
  },
};

function repositoryId(repository: string): Repository['id'] {
  const entry = Object.entries(repoMap).find(([, name]) => name === repository);
  return (entry ? Number(entry[0]) : 1) as Repository['id'];
}

// "Now" is fixed so that the generated data doesn't change from one day to
// the newSide.
const REFERENCE_TIMESTAMP = Date.UTC(2026, 9, 28, 14, 0, 0) / 1000;

function fakeChangeset(
  repository: string,
  revision: string,
  index: number,
): Changeset {
  const random = createRandom(`push|${repository}|${revision}`);
  const known = knownRevisions[revision];
  const author = known?.author ?? random.pick(authors);
  const message = known?.message ?? random.pick(commitMessages);
  const id = repositoryId(repository);
  const pushId =
    1_500_000 + (hashString(`${repository}|${revision}`) % 400_000);

  const revisions = [
    {
      result_set_id: pushId,
      repository_id: id,
      revision,
      author,
      comments: message,
    },
  ];
  if (id === 4) {
    // Try pushes start with the try_task_config commit.
    revisions.unshift({
      result_set_id: pushId,
      repository_id: id,
      revision: fakeHash(`try_task_config|${revision}`),
      author,
      comments: 'try_task_config for code-review\nPushed via `mach try perf`',
    });
  }

  return {
    id: pushId,
    revision,
    author,
    revisions,
    revision_count: revisions.length,
    push_timestamp: REFERENCE_TIMESTAMP - index * 3600 - random.int(0, 3000),
    repository_id: id,
  };
}

function fakeRecentPushes(
  repository: string,
  { author, search }: { author: string | null; search: string | null },
) {
  const pinned = [
    fakeDefaultComparison.baseRev,
    ...fakeDefaultComparison.newRevs,
  ].filter(
    (revision, i) =>
      (i === 0
        ? fakeDefaultComparison.baseRepo
        : fakeDefaultComparison.newRepos[i - 1]) === repository,
  );
  const generated = Array.from({ length: 30 - pinned.length }, (_, i) =>
    fakeHash(`recent|${repository}|${i}`),
  );
  let pushes = [...pinned, ...generated].map((revision, i) =>
    fakeChangeset(repository, revision, i),
  );
  if (author) {
    const needle = author.toLowerCase();
    pushes = pushes.filter((push) =>
      push.author.toLowerCase().includes(needle),
    );
  }
  if (search) {
    const needle = search.toLowerCase();
    pushes = pushes.filter((push) =>
      push.revisions.some(
        (revision) =>
          revision.revision.startsWith(needle) ||
          revision.comments.toLowerCase().includes(needle),
      ),
    );
  }
  return pushes;
}

// ---------------------------------------------------------------------------
// Request routing
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseResultsRequest(params: URLSearchParams): ResultsRequest {
  const baseRepo = (params.get('base_repository') ??
    'mozilla-central') as Repository['name'];
  const newRev = params.get('new_revision') ?? '';
  // Over time requests have no base revision: derive a stable one from the
  // interval so that the base values are still consistent.
  const baseRev =
    params.get('base_revision') ??
    fakeHash(`over-time|${baseRepo}|${params.get('interval') ?? ''}`);
  const parentSignature = params.get('base_parent_signature');
  return {
    baseRev,
    baseRepo,
    newRev,
    newRepo: (params.get('new_repository') ?? baseRepo) as Repository['name'],
    frameworkId: Number(params.get('framework') ?? 1) as Framework['id'],
    replicates: params.get('replicates') === 'true',
    testVersion: params.get('test_version') ?? 'student-t',
    parentSignature: parentSignature ? Number(parentSignature) : null,
  };
}

// Answers a Treeherder API request with fake data. The returned promise
// resolves after a small delay to mimic the network, so that loading states
// are visible too.
export async function fakeTreeherderFetch(rawUrl: string): Promise<Response> {
  const url = new URL(rawUrl);
  const { pathname, searchParams } = url;
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (pathname.startsWith('/api/perfcompare/results')) {
    return jsonResponse(generateResults(parseResultsRequest(searchParams)));
  }

  const pushMatch = /^\/api\/project\/([^/]+)\/push\/$/.exec(pathname);
  if (pushMatch) {
    const repository = pushMatch[1];
    const revision = searchParams.get('revision');
    if (revision) {
      return jsonResponse({
        results: [fakeChangeset(repository, revision, 0)],
      });
    }
    return jsonResponse({
      results: fakeRecentPushes(repository, {
        author: searchParams.get('author_contains'),
        search: searchParams.get('search'),
      }),
    });
  }

  // Retriggering would send these fake job ids to the real Taskcluster, so
  // refuse it explicitly.
  if (
    /^\/api\/project\/[^/]+\/(jobs\/\d+|push\/decisiontask)\/$/.test(pathname)
  ) {
    return jsonResponse(
      'Retriggering jobs is not available with fake data.',
      400,
    );
  }

  const hashMatch = /^\/api\/project\/[^/]+\/hash\/tocommit\/$/.exec(pathname);
  if (hashMatch) {
    return jsonResponse({
      baseRevision: fakeDefaultComparison.baseRev,
      newRevision: fakeDefaultComparison.newRevs[0],
    });
  }

  return jsonResponse(
    `The fake Treeherder backend doesn't know how to answer ${pathname}`,
    400,
  );
}
