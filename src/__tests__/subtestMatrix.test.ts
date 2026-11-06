import { STUDENT_T } from '../common/constants';
import { sortResults } from '../hooks/useTableSort';
import type { CompareResultsItem } from '../types/state';
import type { Platform } from '../types/types';
import {
  agreementScore,
  buildMatrixColumns,
  buildSubtestMatrix,
  classifyAgreement,
  compareSubtestNames,
  type PlatformSubtestResults,
} from '../utils/subtestMatrix';
import getTestData from './utils/fixtures';

const LINUX = 'linux1804-64-shippable-qr' as Platform;
const WINDOWS = 'windows11-64-24h2-shippable' as Platform;
const MAC = 'macosx1500-aarch64-shippable' as Platform;

type Outcome = 'improvement' | 'regression' | 'none';

function subtest(
  test: string,
  outcome: Outcome,
  overrides: Partial<CompareResultsItem> = {},
): CompareResultsItem {
  const [template] = getTestData().subtestsResult;
  return {
    ...template,
    test,
    is_improvement: outcome === 'improvement',
    is_regression: outcome === 'regression',
    ...overrides,
  };
}

function platformResults(
  platform: Platform,
  results: CompareResultsItem[],
  extra: Partial<PlatformSubtestResults> = {},
): PlatformSubtestResults {
  return {
    platform,
    baseParentSignature: '1',
    newParentSignature: '2',
    results: results.map((result) => ({ ...result, platform })),
    ...extra,
  };
}

describe('classifyAgreement', () => {
  it.each([
    [0, 0, 3, 'no-change'],
    [1, 1, 3, 'mixed'],
    [0, 3, 3, 'consistent-regression'],
    [0, 2, 3, 'partial-regression'],
    [2, 0, 2, 'consistent-improvement'],
    [1, 0, 3, 'partial-improvement'],
    // A single reporting platform can't be consistent across platforms.
    [0, 1, 1, 'partial-regression'],
  ])(
    'classifies %i improvements and %i regressions out of %i',
    (improvements, regressions, present, expected) => {
      expect(classifyAgreement(improvements, regressions, present)).toBe(
        expected,
      );
    },
  );
});

describe('agreementScore', () => {
  it('ranks more regressions higher and breaks ties by share', () => {
    const scores = [
      agreementScore({ regressions: 2, improvements: 0, present: 2 }),
      agreementScore({ regressions: 2, improvements: 0, present: 6 }),
      agreementScore({ regressions: 1, improvements: 0, present: 1 }),
      agreementScore({ regressions: 0, improvements: 0, present: 3 }),
      agreementScore({ regressions: 0, improvements: 2, present: 2 }),
    ];
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe('buildSubtestMatrix', () => {
  it('pivots subtests by platform and counts their outcomes', () => {
    const matrix = buildSubtestMatrix(
      [
        platformResults(LINUX, [
          subtest('a.html', 'regression'),
          subtest('b.html', 'improvement'),
        ]),
        platformResults(WINDOWS, [
          subtest('a.html', 'regression'),
          subtest('b.html', 'regression'),
        ]),
        platformResults(MAC, [subtest('a.html', 'none')]),
      ],
      STUDENT_T,
    );

    expect(matrix.columns.map(({ key, label }) => [key, label])).toEqual([
      ['platform-0', 'Linux 18.04'],
      ['platform-1', 'Windows 11'],
      ['platform-2', 'macOS 15'],
    ]);

    const [rowA, rowB] = matrix.rows;
    expect(rowA).toMatchObject({
      test: 'a.html',
      regressions: 2,
      unchanged: 1,
      present: 3,
      agreement: 'partial-regression',
    });
    expect(rowB).toMatchObject({
      test: 'b.html',
      regressions: 1,
      improvements: 1,
      present: 2,
      agreement: 'mixed',
    });
    expect(rowB.cells.has('platform-2')).toBe(false);
    expect(rowA.cells.get('platform-0')).toMatchObject({
      status: 'regression',
      deltaPct: 1.14,
    });
  });

  it('keeps the first of duplicate subtest names on a platform', () => {
    const matrix = buildSubtestMatrix(
      [
        platformResults(LINUX, [
          subtest('a.html', 'regression'),
          subtest('a.html', 'improvement'),
        ]),
      ],
      STUDENT_T,
    );
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0]).toMatchObject({ regressions: 1, present: 1 });
  });

  it('labels same-named platforms with the options that set them apart', () => {
    const matrix = buildSubtestMatrix(
      [
        platformResults(LINUX, [
          subtest('a.html', 'none', { extra_options: 'e10s fission' }),
        ]),
        platformResults(LINUX, [
          subtest('a.html', 'none', { extra_options: 'e10s' }),
        ]),
      ],
      STUDENT_T,
    );
    expect(
      matrix.columns.map(({ label, shortLabel, tag }) => [
        label,
        shortLabel,
        tag,
      ]),
    ).toEqual([
      ['Linux 18.04 (fission)', 'Linux 18.04', 'fission'],
      ['Linux 18.04 (opt e10s)', 'Linux 18.04', 'opt e10s'],
    ]);
  });

  it('keeps a column for a platform that failed to load', () => {
    const matrix = buildSubtestMatrix(
      [
        platformResults(LINUX, [subtest('a.html', 'none')]),
        platformResults(WINDOWS, [], { error: 'Error: 500' }),
      ],
      STUDENT_T,
    );
    expect(matrix.columns[1]).toMatchObject({ error: 'Error: 500' });
    expect(matrix.rows[0]).toMatchObject({ present: 1, totalPlatforms: 2 });
  });
});

describe('buildMatrixColumns', () => {
  const matrix = buildSubtestMatrix(
    [
      platformResults(LINUX, [
        subtest('consistent.html', 'regression'),
        subtest('improved.html', 'improvement', { delta_percentage: -5 }),
        subtest('partial.html', 'regression', { delta_percentage: 10 }),
      ]),
      platformResults(WINDOWS, [
        subtest('consistent.html', 'regression'),
        subtest('improved.html', 'improvement'),
        subtest('partial.html', 'none'),
      ]),
    ],
    STUDENT_T,
  );
  const columns = buildMatrixColumns(matrix.columns, () => null);
  const sortedTests = (columnId: string, direction: 'asc' | 'desc') =>
    sortResults(
      columns,
      matrix.rows,
      columnId,
      direction,
      compareSubtestNames,
    ).map(({ test }) => test);

  it('sorts the strongest regressions first by agreement', () => {
    expect(sortedTests('agreement', 'desc')).toEqual([
      'consistent.html',
      'partial.html',
      'improved.html',
    ]);
  });

  it('sorts a platform by change, better first when descending', () => {
    // lower_is_better, so a negative delta is the best change.
    expect(sortedTests('platform-0', 'desc')).toEqual([
      'improved.html',
      'consistent.html',
      'partial.html',
    ]);
  });
});
