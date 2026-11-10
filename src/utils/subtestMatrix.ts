// Pivots the subtests of one test across the platforms it ran on: one row per
// subtest, one column per platform, plus an agreement summary per row.

import type { ReactNode } from 'react';

import { getPlatformAndVersion } from './platform';
import { stringComparisonCollator } from './sortFunctions';
import { tooltipAgreement } from '../common/constants';
import { getStrategy } from '../common/testVersions';
import type { CombinedResultsItemType } from '../types/state';
import type { TableConfig, TestVersion } from '../types/types';

export type PlatformSubtestResults = {
  platform: string;
  baseParentSignature: string;
  newParentSignature: string;
  results: CombinedResultsItemType[];
  // Set when the fetch failed: the column still renders, flagged, so the
  // platform doesn't silently look like it has no change.
  error?: string;
};

export type PlatformColumnInfo = {
  key: string;
  platform: string;
  // eg. "Windows 11 (webrender-sw)": shortLabel plus tag, if any.
  label: string;
  shortLabel: string;
  // What sets this column apart from others with the same shortLabel.
  tag?: string;
  baseParentSignature: string;
  newParentSignature: string;
  error?: string;
};

export type MatrixCellStatus = 'improvement' | 'regression' | 'noise' | 'none';

export type MatrixCell = {
  result: CombinedResultsItemType;
  status: MatrixCellStatus;
  deltaPct: number | null;
};

export type AgreementBucket =
  | 'consistent-regression'
  | 'partial-regression'
  | 'mixed'
  | 'partial-improvement'
  | 'consistent-improvement'
  | 'no-change';

export type SubtestMatrixRow = {
  test: string;
  cells: Map<string, MatrixCell>;
  improvements: number;
  regressions: number;
  noise: number;
  unchanged: number;
  // The number of platforms that reported this subtest.
  present: number;
  totalPlatforms: number;
  agreement: AgreementBucket;
  score: number;
};

export type SubtestMatrix = {
  columns: PlatformColumnInfo[];
  rows: SubtestMatrixRow[];
  // Platforms left out because none of their subtests has both base and new
  // runs.
  hiddenPlatforms: string[];
};

export const agreementLabels: Record<AgreementBucket, string> = {
  'consistent-regression': 'Consistent regression',
  'partial-regression': 'Partial regression',
  mixed: 'Mixed',
  'partial-improvement': 'Partial improvement',
  'consistent-improvement': 'Consistent improvement',
  'no-change': 'No change / noise',
};

// "Consistent" needs at least this many agreeing platforms: a subtest reported
// by a single platform can't confirm anything across platforms.
const MIN_CONSISTENT_PLATFORMS = 2;

function cellStatus(
  result: CombinedResultsItemType,
  testVersion: TestVersion,
): MatrixCellStatus {
  const strategy = getStrategy(testVersion);
  // Noise first so the buckets stay mutually exclusive, like the Status filter.
  if (strategy.isNoise(result)) return 'noise';
  if (strategy.isImprovement(result)) return 'improvement';
  if (strategy.isRegression(result)) return 'regression';
  return 'none';
}

export function classifyAgreement(
  improvements: number,
  regressions: number,
  present: number,
): AgreementBucket {
  if (improvements + regressions === 0) return 'no-change';
  if (improvements > 0 && regressions > 0) return 'mixed';
  const agreeing = improvements || regressions;
  const consistent =
    agreeing === present && agreeing >= MIN_CONSISTENT_PLATFORMS;
  if (regressions > 0) {
    return consistent ? 'consistent-regression' : 'partial-regression';
  }
  return consistent ? 'consistent-improvement' : 'partial-improvement';
}

// Higher means more platforms regressed (net of improvements), lower means more
// improved. Ties go to the larger share of reporting platforms, so eg. 2 of 2
// regressed outranks 2 of 6.
export function agreementScore({
  improvements,
  regressions,
  present,
}: Pick<SubtestMatrixRow, 'improvements' | 'regressions' | 'present'>) {
  const net = regressions - improvements;
  return net + net / (present + 1);
}

function configTokens(platformResult: PlatformSubtestResults): string[] {
  const result = platformResult.results[0];
  if (!result) return [];
  return [result.option_name, ...result.extra_options.split(' ')].filter(
    Boolean,
  );
}

// Platforms are merged across test options, so two columns can share a short
// name (eg. Linux 18.04 with and without fission): tag them with what sets
// them apart.
function columnLabels(
  platformResults: PlatformSubtestResults[],
): Array<Pick<PlatformColumnInfo, 'label' | 'shortLabel' | 'tag'>> {
  const shortLabels = platformResults.map(
    ({ platform }) => getPlatformAndVersion(platform) || platform,
  );
  return shortLabels.map((shortLabel, index) => {
    const collidingIndexes = shortLabels
      .map((other, otherIndex) => (other === shortLabel ? otherIndex : -1))
      .filter((otherIndex) => otherIndex !== -1);
    if (collidingIndexes.length === 1) return { label: shortLabel, shortLabel };

    const tokensPerColumn = collidingIndexes.map((otherIndex) =>
      configTokens(platformResults[otherIndex]),
    );
    const ownTokens = configTokens(platformResults[index]);
    const distinct = ownTokens.filter(
      (token) => !tokensPerColumn.every((tokens) => tokens.includes(token)),
    );
    const tag =
      distinct.join(' ') ||
      ownTokens.join(' ') ||
      platformResults[index].platform;
    return { label: `${shortLabel} (${tag})`, shortLabel, tag };
  });
}

// A subtest missing its base or new runs has nothing to compare: showing it
// would read as "No change".
function hasBothRuns(result: CombinedResultsItemType) {
  return result.base_runs.length > 0 && result.new_runs.length > 0;
}

// Drops the results without data, then the platforms left with none. Failed
// platforms are kept so that their column flags the error.
function withComparableData(platformResults: PlatformSubtestResults[]) {
  const kept: PlatformSubtestResults[] = [];
  const hiddenPlatforms: string[] = [];
  for (const platformResult of platformResults) {
    const results = platformResult.results.filter(hasBothRuns);
    if (platformResult.error || results.length > 0) {
      kept.push({ ...platformResult, results });
    } else {
      hiddenPlatforms.push(platformResult.platform);
    }
  }
  return { kept, hiddenPlatforms };
}

export function buildSubtestMatrix(
  allPlatformResults: PlatformSubtestResults[],
  testVersion: TestVersion,
): SubtestMatrix {
  const strategy = getStrategy(testVersion);
  const { kept: platformResults, hiddenPlatforms } =
    withComparableData(allPlatformResults);
  const labels = columnLabels(platformResults);
  const columns: PlatformColumnInfo[] = platformResults.map(
    (platformResult, index) => ({
      // Index-based so that keys are unique and URL-safe.
      key: `platform-${index}`,
      platform: platformResult.platform,
      ...labels[index],
      baseParentSignature: platformResult.baseParentSignature,
      newParentSignature: platformResult.newParentSignature,
      error: platformResult.error,
    }),
  );
  const totalPlatforms = columns.length;
  const rowsByTest = new Map<string, SubtestMatrixRow>();

  platformResults.forEach((platformResult, index) => {
    const column = columns[index];
    for (const result of platformResult.results) {
      let row = rowsByTest.get(result.test);
      if (!row) {
        row = {
          test: result.test,
          cells: new Map(),
          improvements: 0,
          regressions: 0,
          noise: 0,
          unchanged: 0,
          present: 0,
          totalPlatforms,
          agreement: 'no-change',
          score: 0,
        };
        rowsByTest.set(result.test, row);
      }

      // Duplicate subtest names can happen (see the subtests table); keep the
      // first one rather than counting a platform twice.
      if (row.cells.has(column.key)) continue;

      const status = cellStatus(result, testVersion);
      row.cells.set(column.key, {
        result,
        status,
        deltaPct: strategy.getDeltaPct(result),
      });
      row.present++;
      if (status === 'improvement') row.improvements++;
      else if (status === 'regression') row.regressions++;
      else if (status === 'noise') row.noise++;
      else row.unchanged++;
    }
  });

  const rows = [...rowsByTest.values()];
  for (const row of rows) {
    row.agreement = classifyAgreement(
      row.improvements,
      row.regressions,
      row.present,
    );
    row.score = agreementScore(row);
  }

  return { columns, rows, hiddenPlatforms };
}

/* --- Table configuration --- */

export const AGREEMENT_COLUMN = 'agreement';
// Strongest consistent regressions first.
export const DEFAULT_MATRIX_SORT = `${AGREEMENT_COLUMN}|desc`;

// Fixed widths so that the first two columns can stick while scrolling.
export const SUBTESTS_COLUMN_WIDTH = 240;
export const AGREEMENT_COLUMN_WIDTH = 180;
export const PLATFORM_COLUMN_MIN_WIDTH = 110;

export function compareSubtestNames(
  rowA: SubtestMatrixRow,
  rowB: SubtestMatrixRow,
) {
  return stringComparisonCollator.compare(rowA.test, rowB.test);
}

// Normalized so that "better" is always positive whatever the metric's
// direction. Missing values sort as 0.
function normalizedDelta(cell: MatrixCell | undefined): number {
  if (!cell || cell.deltaPct === null) return 0;
  return cell.result.lower_is_better ? -cell.deltaPct : cell.deltaPct;
}

export function buildMatrixColumns(
  columns: PlatformColumnInfo[],
  renderTag: (column: PlatformColumnInfo) => ReactNode,
): TableConfig<SubtestMatrixRow> {
  return [
    {
      key: 'subtests',
      name: 'Subtests',
      gridWidth: `${SUBTESTS_COLUMN_WIDTH}px`,
      sortFunction: compareSubtestNames,
    },
    {
      key: AGREEMENT_COLUMN,
      name: 'Agreement',
      gridWidth: `${AGREEMENT_COLUMN_WIDTH}px`,
      tooltip: tooltipAgreement,
      filter: true,
      possibleValues: (Object.keys(agreementLabels) as AgreementBucket[]).map(
        (key) => ({ key, label: agreementLabels[key] }),
      ),
      matchesFunction: (row, value) => row.agreement === value,
      sortFunction: (rowA, rowB) => rowA.score - rowB.score,
    },
    ...columns.map((column) => ({
      key: column.key,
      name: column.label,
      gridWidth: `minmax(${PLATFORM_COLUMN_MIN_WIDTH}px, 1fr)`,
      tooltip: column.platform,
      label: column.shortLabel,
      subLabel: column.tag ? renderTag(column) : undefined,
      sortFunction: (rowA: SubtestMatrixRow, rowB: SubtestMatrixRow) =>
        normalizedDelta(rowA.cells.get(column.key)) -
        normalizedDelta(rowB.cells.get(column.key)),
    })),
  ];
}

export function matrixRowMatchesSearchTerm(
  row: SubtestMatrixRow,
  searchTerm: string,
) {
  return row.test.toLowerCase().includes(searchTerm);
}
