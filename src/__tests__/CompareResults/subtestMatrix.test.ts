import { MANN_WHITNEY_U, STUDENT_T } from '../../common/constants';
import type {
  CombinedResultsItemType,
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../types/state';
import {
  agreementScore,
  buildMatrixColumns,
  buildSubtestMatrix,
  classifyAgreement,
  filterMatrixRows,
  platformKey,
  sortMatrixRows,
  type PlatformSubtestResults,
} from '../../utils/subtestMatrix';
import getTestData, { cloneSubtestsForPlatform } from '../utils/fixtures';

const LINUX = 'linux1804-64-shippable-qr';
const WINDOWS = 'windows10-64-shippable-qr';
const MACOS = 'macosx1015-64-shippable-qr';

function studentTRows(): CompareResultsItem[] {
  const { subtestsResult } = getTestData();
  return subtestsResult;
}

function mannWhitneyRows(): MannWhitneyResultsItem[] {
  const { subtestsMannWhitneyResult } = getTestData();
  return subtestsMannWhitneyResult;
}

function asPlatform(
  platform: string,
  results: CombinedResultsItemType[],
  error?: string,
): PlatformSubtestResults {
  return {
    platform,
    baseParentSignature: '1',
    newParentSignature: '2',
    results,
    error,
  };
}

function improved<T extends CompareResultsItem>(rows: T[]): T[] {
  return rows.map((row) => ({
    ...row,
    is_improvement: true,
    is_regression: false,
  }));
}

function regressed<T extends CompareResultsItem>(rows: T[]): T[] {
  return rows.map((row) => ({
    ...row,
    is_improvement: false,
    is_regression: true,
  }));
}

function columnsFor(matrixColumns: ReturnType<typeof buildSubtestMatrix>) {
  return buildMatrixColumns(matrixColumns.columns, 'tooltip', () => null);
}

describe('buildSubtestMatrix', () => {
  it('marks a subtest that improves on every platform as all-improved', () => {
    const base = improved(studentTRows());
    const matrix = buildSubtestMatrix(
      [
        asPlatform(LINUX, base),
        asPlatform(
          WINDOWS,
          improved(cloneSubtestsForPlatform(base, WINDOWS, 100)),
        ),
        asPlatform(MACOS, improved(cloneSubtestsForPlatform(base, MACOS, 200))),
      ],
      STUDENT_T,
    );

    expect(matrix.columns.map((column) => column.platform)).toEqual([
      LINUX,
      WINDOWS,
      MACOS,
    ]);
    for (const row of matrix.rows) {
      expect(row.agreement).toBe('all-improved');
      expect(row.improvements).toBe(3);
      expect(row.present).toBe(3);
      expect(row.totalPlatforms).toBe(3);
    }
  });

  it('does not count a platform where the subtest is missing', () => {
    const base = improved(studentTRows());
    const firstTest = base[0].test;
    const matrix = buildSubtestMatrix(
      [
        asPlatform(LINUX, base),
        asPlatform(
          WINDOWS,
          improved(cloneSubtestsForPlatform(base, WINDOWS, 100)),
        ),
        // This platform only reports the first subtest.
        asPlatform(
          MACOS,
          improved(cloneSubtestsForPlatform(base.slice(0, 1), MACOS, 200)),
        ),
      ],
      STUDENT_T,
    );

    const rowWithEveryPlatform = matrix.rows.find(
      (row) => row.test === firstTest,
    );
    const rowMissingOnMacos = matrix.rows.find((row) => row.test !== firstTest);

    expect(rowWithEveryPlatform?.present).toBe(3);
    expect(rowMissingOnMacos?.present).toBe(2);
    expect(rowMissingOnMacos?.totalPlatforms).toBe(3);
    // Missing platforms don't count against the agreement.
    expect(rowMissingOnMacos?.agreement).toBe('all-improved');
    expect(rowMissingOnMacos?.cells.size).toBe(2);
  });

  it('classifies a subtest that moves both ways as mixed', () => {
    const base = improved(studentTRows());
    const matrix = buildSubtestMatrix(
      [
        asPlatform(LINUX, base),
        asPlatform(
          WINDOWS,
          regressed(cloneSubtestsForPlatform(base, WINDOWS, 100)),
        ),
      ],
      STUDENT_T,
    );

    for (const row of matrix.rows) {
      expect(row.agreement).toBe('mixed');
      expect(row.improvements).toBe(1);
      expect(row.regressions).toBe(1);
    }
  });

  it('classifies an improvement on some platforms only as mostly-improved', () => {
    const base = improved(studentTRows());
    const matrix = buildSubtestMatrix(
      [
        asPlatform(LINUX, base),
        // Neither an improvement nor a regression on this platform.
        asPlatform(
          WINDOWS,
          cloneSubtestsForPlatform(base, WINDOWS, 100, () => ({
            is_improvement: false,
            is_regression: false,
          })),
        ),
      ],
      STUDENT_T,
    );

    for (const row of matrix.rows) {
      expect(row.agreement).toBe('mostly-improved');
      expect(row.improvements).toBe(1);
      expect(row.unchanged).toBe(1);
    }
  });

  it('treats a Mann-Whitney result that is not significant as noise', () => {
    const rows = mannWhitneyRows().map((row) => ({
      ...row,
      direction_of_change: 'regression' as const,
      mann_whitney_test: {
        test_name: 'Mann Whitney U',
        stat: 0,
        pvalue: 0.5,
        interpretation: 'not significant',
      },
    }));

    const matrix = buildSubtestMatrix(
      [asPlatform(LINUX, rows)],
      MANN_WHITNEY_U,
    );

    for (const row of matrix.rows) {
      expect(row.noise).toBe(1);
      expect(row.regressions).toBe(0);
      // A row that is only noise has no agreement to report.
      expect(row.agreement).toBe('no-change');
    }
  });

  it('never marks a Student-T result as noise', () => {
    const matrix = buildSubtestMatrix(
      [asPlatform(LINUX, improved(studentTRows()))],
      STUDENT_T,
    );

    for (const row of matrix.rows) {
      expect(row.noise).toBe(0);
      expect(row.improvements).toBe(1);
    }
  });

  it('keeps the first of two subtests sharing a name and warns', () => {
    const consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const base = studentTRows();
    const duplicated = [base[0], { ...base[0], delta_percentage: 99 }];

    const matrix = buildSubtestMatrix(
      [asPlatform(LINUX, duplicated)],
      STUDENT_T,
    );

    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].cells.get(platformKey(LINUX))?.deltaPct).toBe(
      base[0].delta_percentage,
    );
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('appears more than once'),
    );
    consoleWarn.mockRestore();
  });

  it('keeps a failing platform as a column carrying its error', () => {
    const matrix = buildSubtestMatrix(
      [
        asPlatform(LINUX, studentTRows()),
        asPlatform(WINDOWS, [], 'Error: 500'),
      ],
      STUDENT_T,
    );

    expect(matrix.columns).toHaveLength(2);
    expect(matrix.columns[1].error).toBe('Error: 500');
    for (const row of matrix.rows) {
      expect(row.cells.has(platformKey(WINDOWS))).toBe(false);
    }
  });
});

describe('classifyAgreement and agreementScore', () => {
  it.each([
    [0, 0, 3, 'no-change'],
    [3, 0, 3, 'all-improved'],
    [0, 3, 3, 'all-regressed'],
    [2, 0, 3, 'mostly-improved'],
    [0, 2, 3, 'mostly-regressed'],
    [2, 1, 3, 'mixed'],
  ])(
    '%i improvements / %i regressions out of %i is %s',
    (improvements, regressions, present, expected) => {
      expect(classifyAgreement(improvements, regressions, present)).toBe(
        expected,
      );
    },
  );

  it('ranks a wider agreement above a narrower one in the same direction', () => {
    const wide = agreementScore({
      improvements: 4,
      regressions: 0,
      totalPlatforms: 6,
    });
    const narrow = agreementScore({
      improvements: 2,
      regressions: 0,
      totalPlatforms: 6,
    });
    const mixed = agreementScore({
      improvements: 2,
      regressions: 2,
      totalPlatforms: 6,
    });
    const regressing = agreementScore({
      improvements: 0,
      regressions: 4,
      totalPlatforms: 6,
    });

    expect(wide).toBeGreaterThan(narrow);
    expect(narrow).toBeGreaterThan(mixed);
    expect(mixed).toBeGreaterThan(regressing);
  });
});

describe('filterMatrixRows', () => {
  const base = improved(studentTRows());
  const matrix = buildSubtestMatrix(
    [
      asPlatform(LINUX, base),
      asPlatform(
        WINDOWS,
        regressed(cloneSubtestsForPlatform(base, WINDOWS, 1)),
      ),
    ],
    STUDENT_T,
  );
  const config = columnsFor(matrix);

  it('matches a search term against the subtest name', () => {
    const filtered = filterMatrixRows(config, matrix.rows, 'dhtml', new Map());
    expect(filtered.map((row) => row.test)).toEqual(['dhtml.html']);
  });

  it('excludes rows matching a negated search term', () => {
    const filtered = filterMatrixRows(config, matrix.rows, '-dhtml', new Map());
    expect(filtered.map((row) => row.test)).not.toContain('dhtml.html');
    expect(filtered).toHaveLength(matrix.rows.length - 1);
  });

  it('keeps only the rows in a checked agreement bucket', () => {
    const kept = filterMatrixRows(
      config,
      matrix.rows,
      '',
      new Map([['agreement', new Set(['mixed'])]]),
    );
    expect(kept).toHaveLength(matrix.rows.length);

    const dropped = filterMatrixRows(
      config,
      matrix.rows,
      '',
      new Map([['agreement', new Set(['all-improved'])]]),
    );
    expect(dropped).toHaveLength(0);
  });
});

describe('sortMatrixRows', () => {
  const base = studentTRows();
  const matrix = buildSubtestMatrix(
    [
      asPlatform(LINUX, [
        { ...base[0], is_improvement: true, is_regression: false },
        { ...base[1], is_improvement: false, is_regression: true },
      ]),
      asPlatform(
        WINDOWS,
        // Only the first subtest ran here, so the second row has no value in
        // this column.
        cloneSubtestsForPlatform([base[0]], WINDOWS, 1, () => ({
          is_improvement: true,
          is_regression: false,
          delta_percentage: -8,
        })),
      ),
    ],
    STUDENT_T,
  );
  const config = columnsFor(matrix);

  it('sorts by agreement, improvements first when descending', () => {
    const descending = sortMatrixRows(config, matrix.rows, 'agreement', 'desc');
    expect(descending[0].agreement).toBe('all-improved');

    const ascending = sortMatrixRows(config, matrix.rows, 'agreement', 'asc');
    expect(ascending[0].agreement).toBe('all-regressed');
  });

  it('keeps rows without a value at the bottom of a platform column', () => {
    const key = platformKey(WINDOWS);
    for (const direction of ['asc', 'desc'] as const) {
      const sorted = sortMatrixRows(config, matrix.rows, key, direction);
      expect(sorted.at(-1)?.cells.has(key)).toBe(false);
    }
  });

  it('falls back to the subtest name when no column is sorted', () => {
    const sorted = sortMatrixRows(config, matrix.rows, null, null);
    expect(sorted.map((row) => row.test)).toEqual(
      [...matrix.rows.map((row) => row.test)].sort(),
    );
  });
});
