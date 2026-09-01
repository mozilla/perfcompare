// Pivots the subtests of one test/suite across every platform it ran on into a
// matrix: one row per subtest, one column per platform. The point is to make
// cross-platform agreement visible — a subtest that improves on five platforms
// is much more trustworthy than one that improves on a single platform.

import { getPlatformAndVersion } from './platform';
import { stringComparisonCollator } from './sortFunctions';
import { getSubtestsCompareWithBaseLink } from './subtestsLinks';
import { MANN_WHITNEY_U } from '../common/constants';
import { getStrategy } from '../common/testVersions';
import {
  formatMedianDiffPct,
  medianDiffPct,
} from '../common/testVersions/mannWhitney';
import type {
  CombinedResultsItemType,
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../types/state';
import type { BasicColumn, TestVersion } from '../types/types';

export type PlatformSubtestResults = {
  platform: string;
  baseParentSignature: string;
  newParentSignature: string;
  results: CombinedResultsItemType[];
  // Set when the fetch for this platform failed; the column still renders, but
  // empty, so the user sees that the platform is missing rather than passing.
  error?: string;
};

export type PlatformColumnInfo = {
  key: string;
  platform: string;
  label: string;
  error?: string;
};

export type MatrixCellStatus = 'improvement' | 'regression' | 'none' | 'noise';

export type MatrixCell = {
  result: CombinedResultsItemType;
  status: MatrixCellStatus;
  deltaPct: number | null;
  link: string;
};

export type AgreementBucket =
  | 'all-improved'
  | 'mostly-improved'
  | 'mixed'
  | 'mostly-regressed'
  | 'all-regressed'
  | 'no-change';

export type SubtestMatrixRow = {
  test: string;
  cells: Map<string, MatrixCell>;
  improvements: number;
  regressions: number;
  noise: number;
  unchanged: number;
  // The number of platforms that actually reported this subtest.
  present: number;
  totalPlatforms: number;
  agreement: AgreementBucket;
  score: number;
};

export type SubtestMatrix = {
  columns: PlatformColumnInfo[];
  rows: SubtestMatrixRow[];
};

export const AGREEMENT_FILTER_VALUES = [
  { label: 'All improved', key: 'all-improved' },
  { label: 'Mostly improved', key: 'mostly-improved' },
  { label: 'Mixed', key: 'mixed' },
  { label: 'Mostly regressed', key: 'mostly-regressed' },
  { label: 'All regressed', key: 'all-regressed' },
  { label: 'No change / noise', key: 'no-change' },
];

// The key is used in the DOM, in URL filter params and in cookies, so keep it
// to a conservative character set.
export function platformKey(platform: string): string {
  return `platform-${platform.replace(/[^a-zA-Z0-9]+/g, '-')}`;
}

function cellStatus(
  result: CombinedResultsItemType,
  testVersion: TestVersion,
): MatrixCellStatus {
  const strategy = getStrategy(testVersion);
  // Noise is checked first so the buckets stay mutually exclusive, matching the
  // rule the Mann-Whitney Status filter already uses.
  if (strategy.isNoise(result)) {
    return 'noise';
  }
  if (strategy.isImprovement(result)) {
    return 'improvement';
  }
  if (strategy.isRegression(result)) {
    return 'regression';
  }
  return 'none';
}

function cellDeltaPct(
  result: CombinedResultsItemType,
  testVersion: TestVersion,
): number | null {
  if (testVersion === MANN_WHITNEY_U) {
    return medianDiffPct(result as MannWhitneyResultsItem);
  }
  return (result as CompareResultsItem).delta_percentage ?? null;
}

export function formatDeltaPct(deltaPct: number | null): string {
  if (deltaPct === null) {
    return '';
  }
  return formatMedianDiffPct(deltaPct);
}

export function classifyAgreement(
  improvements: number,
  regressions: number,
  present: number,
): AgreementBucket {
  if (improvements + regressions === 0) {
    return 'no-change';
  }
  if (improvements > 0 && regressions > 0) {
    return 'mixed';
  }
  if (regressions === 0) {
    return improvements === present ? 'all-improved' : 'mostly-improved';
  }
  return regressions === present ? 'all-regressed' : 'mostly-regressed';
}

// Sorts descending = strongest consistent improvements first, ascending =
// strongest consistent regressions first. The fractional term breaks ties
// within a bucket so that eg. 4/6 improved outranks 2/6 improved.
export function agreementScore(row: {
  improvements: number;
  regressions: number;
  totalPlatforms: number;
}): number {
  const { improvements, regressions, totalPlatforms } = row;
  return (
    improvements -
    regressions +
    (improvements + regressions) / (totalPlatforms + 1)
  );
}

export function buildSubtestMatrix(
  platformResults: PlatformSubtestResults[],
  testVersion: TestVersion,
): SubtestMatrix {
  const usedKeys = new Set<string>();
  const columns: PlatformColumnInfo[] = platformResults.map(
    (platformResult) => {
      let key = platformKey(platformResult.platform);
      // Two rows of the same test group should never share a platform, but the
      // key is lossy, so make sure we never collapse two columns into one.
      let suffix = 2;
      while (usedKeys.has(key)) {
        key = `${platformKey(platformResult.platform)}-${suffix++}`;
      }
      usedKeys.add(key);

      const label = getPlatformAndVersion(platformResult.platform);
      return {
        key,
        platform: platformResult.platform,
        label: label || platformResult.platform,
        error: platformResult.error,
      };
    },
  );

  const rowsByTest = new Map<string, SubtestMatrixRow>();
  const totalPlatforms = columns.length;

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

      if (row.cells.has(column.key)) {
        // The single-platform subtests table already notes that duplicate test
        // names may show up; keep the first one and make the rest visible in
        // the console rather than silently overwriting.
        console.warn(
          `The subtest "${result.test}" appears more than once for the platform ${column.platform}, only the first one is used.`,
        );
        continue;
      }

      const status = cellStatus(result, testVersion);
      row.cells.set(column.key, {
        result,
        status,
        deltaPct: cellDeltaPct(result, testVersion),
        link: getSubtestsCompareWithBaseLink(result, testVersion),
      });
      row.present++;
      switch (status) {
        case 'improvement':
          row.improvements++;
          break;
        case 'regression':
          row.regressions++;
          break;
        case 'noise':
          row.noise++;
          break;
        default:
          row.unchanged++;
      }
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
  rows.sort((rowA, rowB) =>
    stringComparisonCollator.compare(rowA.test, rowB.test),
  );

  return { columns, rows };
}

/* --- Column configuration --- */

// The columns of this table are configured for SubtestMatrixRow rather than for
// a result item, which is why they don't reuse TableConfig. TableHeader and the
// table-state hooks accept the structural TableHeaderConfig, so they still work.
type MatrixFilterableColumn = BasicColumn & {
  name: string;
  filter: true;
  possibleValues: Array<{ label: string; key: string }>;
  matchesFunction: (row: SubtestMatrixRow, value: string) => boolean;
};

type MatrixSortableColumn = BasicColumn & {
  name: string;
  sortFunction: (rowA: SubtestMatrixRow, rowB: SubtestMatrixRow) => number;
  // Rows for which this returns true are kept at the bottom of the table in
  // both sort directions, so that "no value here" never outranks a real value.
  isEmpty?: (row: SubtestMatrixRow) => boolean;
};

export type MatrixColumn =
  | BasicColumn
  | MatrixFilterableColumn
  | MatrixSortableColumn
  | (MatrixFilterableColumn & MatrixSortableColumn);

export type MatrixColumnsConfig = MatrixColumn[];

// A cell's delta is normalized so that "better" is always positive, whatever
// the direction of the metric. Rows without a value for the column sink to the
// bottom whichever way the column is sorted.
function normalizedDelta(cell: MatrixCell | undefined): number | null {
  if (!cell || cell.deltaPct === null) {
    return null;
  }
  return cell.result.lower_is_better ? -cell.deltaPct : cell.deltaPct;
}

export function buildMatrixColumns(
  columns: PlatformColumnInfo[],
  tooltipAgreement: BasicColumn['tooltip'],
  getIcon: (platform: string) => BasicColumn['icon'],
): MatrixColumnsConfig {
  const config: MatrixColumnsConfig = [
    {
      key: 'subtests',
      name: 'Subtests',
      gridWidth: '2.5fr',
      sortFunction: (rowA, rowB) =>
        stringComparisonCollator.compare(rowA.test, rowB.test),
    },
    {
      key: 'agreement',
      name: 'Agreement',
      gridWidth: '1.25fr',
      tooltip: tooltipAgreement,
      filter: true,
      possibleValues: AGREEMENT_FILTER_VALUES,
      matchesFunction: (row, value) => row.agreement === value,
      sortFunction: (rowA, rowB) => rowA.score - rowB.score,
    },
  ];

  for (const column of columns) {
    config.push({
      key: column.key,
      name: column.label,
      gridWidth: '1fr',
      tooltip: column.platform,
      icon: getIcon(column.platform),
      sortFunction: (rowA, rowB) =>
        (normalizedDelta(rowA.cells.get(column.key)) ?? 0) -
        (normalizedDelta(rowB.cells.get(column.key)) ?? 0),
      isEmpty: (row) => normalizedDelta(row.cells.get(column.key)) === null,
    });
  }

  return config;
}

/* --- Filtering and sorting --- */

function rowMatchesSearchTerm(
  row: SubtestMatrixRow,
  searchTerm: string,
): boolean {
  return row.test.toLowerCase().includes(searchTerm);
}

function rowMatchesColumnFilter(
  config: MatrixColumnsConfig,
  row: SubtestMatrixRow,
  columnId: string,
  checkedValues: Set<string>,
): boolean {
  const column = config.find((candidate) => candidate.key === columnId);
  if (!column || !('filter' in column)) {
    return true;
  }

  if (checkedValues.size === column.possibleValues.length) {
    // All the checkboxes are set, so nothing is filtered out.
    return true;
  }

  for (const value of checkedValues) {
    if (column.matchesFunction(row, value)) {
      return true;
    }
  }
  return false;
}

// Same search semantics as filterResults in useTableFilters: whitespace-split
// terms are ANDed, and a term starting with "-" excludes matching rows.
export function filterMatrixRows(
  config: MatrixColumnsConfig,
  rows: SubtestMatrixRow[],
  searchTerm: string,
  tableFilters: Map<string, Set<string>>,
): SubtestMatrixRow[] {
  if (!searchTerm && !tableFilters.size) {
    return rows;
  }

  const searchTerms = searchTerm.toLowerCase().split(/\s+/);

  return rows.filter((row) => {
    for (const term of searchTerms) {
      if (term.startsWith('-')) {
        if (term.length > 1 && rowMatchesSearchTerm(row, term.slice(1))) {
          return false;
        }
      } else if (term && !rowMatchesSearchTerm(row, term)) {
        return false;
      }
    }

    for (const [columnId, checkedValues] of tableFilters) {
      if (!rowMatchesColumnFilter(config, row, columnId, checkedValues)) {
        return false;
      }
    }

    return true;
  });
}

export function sortMatrixRows(
  config: MatrixColumnsConfig,
  rows: SubtestMatrixRow[],
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc' | null,
): SubtestMatrixRow[] {
  const defaultSort = (rowA: SubtestMatrixRow, rowB: SubtestMatrixRow) =>
    stringComparisonCollator.compare(rowA.test, rowB.test);

  if (!sortColumn || !sortDirection) {
    return rows.toSorted(defaultSort);
  }

  const column = config.find((candidate) => candidate.key === sortColumn);
  if (!column || !('sortFunction' in column)) {
    console.warn(`The column ${sortColumn} isn't sortable, ignoring the sort.`);
    return rows.toSorted(defaultSort);
  }

  const { sortFunction } = column;
  const directioned =
    sortDirection === 'desc'
      ? (rowA: SubtestMatrixRow, rowB: SubtestMatrixRow) =>
          sortFunction(rowB, rowA)
      : sortFunction;

  const isEmpty = 'isEmpty' in column ? column.isEmpty : undefined;
  if (!isEmpty) {
    return rows.toSorted(directioned);
  }

  // Partition rather than encode the emptiness in the comparator: reversing the
  // comparator for a descending sort would also reverse such a sentinel.
  const withValue = rows.filter((row) => !isEmpty(row));
  const withoutValue = rows.filter((row) => isEmpty(row));
  return [
    ...withValue.toSorted(directioned),
    ...withoutValue.toSorted(defaultSort),
  ];
}
