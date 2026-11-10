// Pivots the subtests of one test across the platforms it ran on: one row per
// subtest, one column per platform, plus an agreement summary per row.

import type { ReactNode } from 'react';

import { getPlatformAndVersion, getPlatformShortName } from './platform';
import { stringComparisonCollator } from './sortFunctions';
import {
  CROSS_PLATFORM_MAX_WIDTH,
  tooltipAgreement,
} from '../common/constants';
import { getStrategy, type TestVersionStrategy } from '../common/testVersions';
import { Spacing } from '../styles';
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
  // eg. "Windows 11 (shippable)": shortLabel plus the variant, when there are
  // several, and the tag, if any. Used where the header isn't visible.
  label: string;
  // eg. "Windows 11" or "Windows 11 ref", shown in the column header.
  shortLabel: string;
  // Only for columns that still share a shortLabel in the same variant.
  tag?: string;
  // The key of the PlatformVariant that this column belongs to.
  variant: string;
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

// A group of contiguous columns sharing a build type and test options, eg.
// "shippable" and "nightly-as-release".
export type PlatformVariant = {
  key: string;
  label: string;
  columnCount: number;
};

export type SubtestMatrix = {
  // Sorted by variant, then by platform in the same order in every variant.
  columns: PlatformColumnInfo[];
  rows: SubtestMatrixRow[];
  variants: PlatformVariant[];
  // Readable names of the platforms left out because none of their subtests
  // has both base and new runs.
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

// Takes the strategy, so that it's looked up once per matrix.
function cellStatus(
  result: CombinedResultsItemType,
  strategy: TestVersionStrategy,
): MatrixCellStatus {
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

// The build types found in platform names, in display order.
const BUILD_TYPES = [
  { token: 'shippable', label: 'shippable' },
  { token: 'nightlyasrelease', label: 'nightly-as-release' },
  { token: 'asan', label: 'asan' },
  { token: 'tsan', label: 'tsan' },
  { token: 'ccov', label: 'ccov' },
  { token: 'debug', label: 'debug' },
];

function buildType(platform: string) {
  const tokens = platform.split('-');
  return BUILD_TYPES.findIndex(({ token }) => tokens.includes(token));
}

// eg. windows11-64-24h2-hw-ref-shippable: the reference hardware, a different
// machine from the regular windows11-64-24h2-shippable.
function isReferenceHardware(platform: string) {
  return /-hw-ref(-|$)/.test(platform);
}

// With normal spaces, as the narrow headers need to wrap, eg. "Galaxy A55".
function platformShortLabel(platform: string) {
  const label = (getPlatformAndVersion(platform) || platform).replace(
    /\u00a0/g,
    ' ',
  );
  return isReferenceHardware(platform) ? `${label} ref` : label;
}

// Keeps the platforms in the same order in every variant.
const OS_ORDER = ['Android', 'Windows', 'Linux', 'macOS', 'iOS'];
function osRank(platform: string) {
  const rank = OS_ORDER.indexOf(getPlatformShortName(platform));
  return rank === -1 ? OS_ORDER.length : rank;
}

type VariantInfo = { key: string; label: string; rank: number };

// Platforms are merged across build types and test options, so the same
// platform can show up several times: group its columns by what sets them
// apart.
function platformVariants(platformResults: PlatformSubtestResults[]) {
  const tokensPerPlatform = platformResults.map(configTokens);
  const withTokens = tokensPerPlatform.filter((tokens) => tokens.length);
  const commonTokens = (withTokens[0] ?? []).filter((token) =>
    withTokens.every((tokens) => tokens.includes(token)),
  );
  const variants = platformResults.map(({ platform }, index): VariantInfo => {
    const buildTypeIndex = buildType(platform);
    const distinctTokens = tokensPerPlatform[index].filter(
      (token) => !commonTokens.includes(token),
    );
    const parts = [
      ...(buildTypeIndex === -1 ? [] : [BUILD_TYPES[buildTypeIndex].label]),
      ...(distinctTokens.length ? [distinctTokens.join(' ')] : []),
    ];
    return {
      key: parts.join(' '),
      label: parts.join(' · ') || 'default',
      rank: buildTypeIndex === -1 ? BUILD_TYPES.length : buildTypeIndex,
    };
  });
  return variants;
}

// eg. "Galaxy S24 (nightly-as-release)", for the hidden platforms notice.
export function describePlatform(platform: string) {
  const index = buildType(platform);
  const label = platformShortLabel(platform);
  return index === -1 ? label : `${label} (${BUILD_TYPES[index].label})`;
}

type SortedColumn = {
  platformResult: PlatformSubtestResults;
  shortLabel: string;
  variant: VariantInfo;
};

function sortColumns(
  platformResults: PlatformSubtestResults[],
  variants: VariantInfo[],
): SortedColumn[] {
  const columns = platformResults.map((platformResult, index) => ({
    platformResult,
    shortLabel: platformShortLabel(platformResult.platform),
    variant: variants[index],
  }));
  // Variants by build type, then by first appearance.
  const variantOrder = [
    ...new Set(
      [...columns]
        .sort((a, b) => a.variant.rank - b.variant.rank)
        .map(({ variant }) => variant.key),
    ),
  ];
  // Stable, so same-named platforms keep the order of the URL.
  return columns.sort(
    (a, b) =>
      variantOrder.indexOf(a.variant.key) -
        variantOrder.indexOf(b.variant.key) ||
      osRank(a.platformResult.platform) - osRank(b.platformResult.platform) ||
      stringComparisonCollator.compare(a.shortLabel, b.shortLabel),
  );
}

// Groups contiguous columns. Columns sharing a shortLabel in the same
// variant are tagged with their platform, the only thing left to tell them
// apart.
function buildColumns(sortedColumns: SortedColumn[]) {
  const variants: PlatformVariant[] = [];
  for (const { variant } of sortedColumns) {
    const last = variants[variants.length - 1];
    if (last?.key === variant.key) last.columnCount++;
    else
      variants.push({ key: variant.key, label: variant.label, columnCount: 1 });
  }
  const hasSeveralVariants = variants.length > 1;

  const columns = sortedColumns.map(
    ({ platformResult, shortLabel, variant }, index): PlatformColumnInfo => {
      const isColliding = sortedColumns.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.variant.key === variant.key &&
          other.shortLabel === shortLabel,
      );
      const tag = isColliding ? platformResult.platform : undefined;
      const qualifiers = [
        ...(hasSeveralVariants && variant.key ? [variant.label] : []),
        ...(tag ? [tag] : []),
      ];
      return {
        // Index-based so that keys are unique and URL-safe.
        key: `platform-${index}`,
        platform: platformResult.platform,
        label: qualifiers.length
          ? `${shortLabel} (${qualifiers.join(', ')})`
          : shortLabel,
        shortLabel,
        tag,
        variant: variant.key,
        baseParentSignature: platformResult.baseParentSignature,
        newParentSignature: platformResult.newParentSignature,
        error: platformResult.error,
      };
    },
  );
  return { columns, variants };
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
      hiddenPlatforms.push(describePlatform(platformResult.platform));
    }
  }
  return { kept, hiddenPlatforms };
}

export function buildSubtestMatrix(
  allPlatformResults: PlatformSubtestResults[],
  testVersion: TestVersion,
): SubtestMatrix {
  const strategy = getStrategy(testVersion);
  const { kept, hiddenPlatforms } = withComparableData(allPlatformResults);
  const variantPerPlatform = platformVariants(kept);
  const sortedColumns = sortColumns(kept, variantPerPlatform);
  const platformResults = sortedColumns.map(
    ({ platformResult }) => platformResult,
  );
  const { columns, variants } = buildColumns(sortedColumns);
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

      const status = cellStatus(result, strategy);
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

  return { columns, rows, variants, hiddenPlatforms };
}

/* --- Table configuration --- */

export const AGREEMENT_COLUMN = 'agreement';
// Strongest consistent regressions first.
export const DEFAULT_MATRIX_SORT = `${AGREEMENT_COLUMN}|desc`;

// Fixed widths so that the first two columns can stick while scrolling.
// Long subtest names wrap.
export const SUBTESTS_COLUMN_WIDTH = 200;
// Fits the "Agreement (6)" header on one line, with some room for fonts.
export const AGREEMENT_COLUMN_WIDTH = 184;
// Fits the compact chip, with the header wrapping inside its button.
export const AGREEMENT_COLUMN_NARROW_WIDTH = 140;
// Fits the longest word of a header, eg. "Windows" next to the sort icon,
// so that names only wrap between words.
export const PLATFORM_COLUMN_MIN_WIDTH = 100;
// Platform columns share the width left, but their buttons and cells stop
// growing at this width, so that they don't turn into wide bars when there
// are only a few platforms. Below it, they shrink with their column.
export const PLATFORM_CONTENT_MAX_WIDTH = 150;
// The page's horizontal padding, from MUI's Container, on each side.
const PAGE_GUTTER = 24;

// The narrowest the table can be, with the grid gaps (Spacing.Small, like the
// header and the rows).
export function matrixMinWidth(platformCount: number, agreementWidth: number) {
  return (
    SUBTESTS_COLUMN_WIDTH +
    agreementWidth +
    platformCount * PLATFORM_COLUMN_MIN_WIDTH +
    (platformCount + 1) * Spacing.Small
  );
}

// The agreement header stays on one line as long as the platforms fit the
// widest page (9 platforms with the current widths). After that, the column
// narrows to fit one more platform before the table scrolls, and its header
// wraps.
export function agreementColumnWidth(platformCount: number) {
  const fits =
    matrixMinWidth(platformCount, AGREEMENT_COLUMN_WIDTH) <=
    CROSS_PLATFORM_MAX_WIDTH - 2 * PAGE_GUTTER;
  return fits ? AGREEMENT_COLUMN_WIDTH : AGREEMENT_COLUMN_NARROW_WIDTH;
}

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
      gridWidth: `${agreementColumnWidth(columns.length)}px`,
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
