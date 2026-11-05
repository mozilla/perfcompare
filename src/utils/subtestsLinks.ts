import { setAdvancedOptionsParams } from './advancedOptionsUrl';
import { preserveFakeDataParam } from '../logic/treeherder';
import type { CombinedResultsItemType } from '../types/state';
import type {
  AdvancedColumns,
  ExpandedRowOptions,
  TestVersion,
} from '../types/types';

export type SubtestsCompareWithBaseParams = {
  baseRev: string;
  baseRepo: string;
  newRev: string;
  newRepo: string;
  framework: number;
  baseParentSignature: string;
  newParentSignature: string;
  // Pre-fills the subtests page search input.
  search?: string;
};

export const buildSubtestsCompareWithBaseLink = (
  values: SubtestsCompareWithBaseParams,
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) => {
  const { search } = values;
  const params = new URLSearchParams({
    baseRev: values.baseRev,
    baseRepo: values.baseRepo,
    newRev: values.newRev,
    newRepo: values.newRepo,
    framework: String(values.framework),
    baseParentSignature: values.baseParentSignature,
    newParentSignature: values.newParentSignature,
    test_version: testVersion,
  });
  if (search) {
    params.set('search', search);
  }
  // Open the subtests page with the same Advanced options.
  setAdvancedOptionsParams(params, advancedColumns, expandedRow, {
    explicit: true,
  });
  preserveFakeDataParam(params);

  return `/subtests-compare-results?${params.toString()}`;
};

export const getSubtestsCompareWithBaseLink = (
  result: CombinedResultsItemType,
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) =>
  buildSubtestsCompareWithBaseLink(
    {
      baseRev: result.base_rev,
      baseRepo: result.base_repository_name,
      newRev: result.new_rev,
      newRepo: result.new_repository_name,
      framework: result.framework_id,
      baseParentSignature: String(result.base_signature_id),
      newParentSignature: String(result.new_signature_id),
    },
    testVersion,
    advancedColumns,
    expandedRow,
  );

export const getSubtestsCompareOverTimeLink = (
  result: CombinedResultsItemType,
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) => {
  // Fetching the interval value directly from the URL avoids a
  // spurious render due to react-router context changing. It's not usually a
  // problem, but because RevisionRow can have a lot of instances, this is a
  // performance problem in our case.
  // If the process of fetching it from the URL is too costly, we might need to
  // pass it down using the props otherwise.
  const currentSearchParams = new URLSearchParams(location.search);
  const interval = currentSearchParams.get('selectedTimeRange');
  if (interval === null) {
    // We should always have it because it's been checked in the loader already.
    // Let's throw if it's absent so that if the loader and URL changes in the
    // future but this path isn't changed, this will be very visible.
    throw new Error(
      "The parameter 'selectedTimeRange' is absent from the search parameters, this should not happen.",
    );
  }

  const params = new URLSearchParams({
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    selectedTimeRange: interval,
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
    test_version: testVersion,
  });
  setAdvancedOptionsParams(params, advancedColumns, expandedRow, {
    explicit: true,
  });
  preserveFakeDataParam(params);

  return `/subtests-compare-over-time-results?${params.toString()}`;
};

// One baseParentSignature/newParentSignature/platform triplet per platform
// that has subtests. Returns null when fewer than 2 have subtests, as there's
// nothing to compare across.
export const getCrossPlatformSubtestsLink = (
  results: CombinedResultsItemType[],
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
): string | null => {
  const rowsWithSubtests = results.filter((result) => result.has_subtests);
  if (rowsWithSubtests.length < 2) {
    return null;
  }

  const [firstResult] = rowsWithSubtests;
  const params = new URLSearchParams({
    baseRev: firstResult.base_rev,
    baseRepo: firstResult.base_repository_name,
    newRev: firstResult.new_rev,
    newRepo: firstResult.new_repository_name,
    framework: String(firstResult.framework_id),
    test_version: testVersion,
  });
  for (const result of rowsWithSubtests) {
    params.append('baseParentSignature', String(result.base_signature_id));
    params.append('newParentSignature', String(result.new_signature_id));
    params.append('platform', result.platform);
  }
  setAdvancedOptionsParams(params, advancedColumns, expandedRow, {
    explicit: true,
  });
  preserveFakeDataParam(params);

  return `/subtests-cross-platform-results?${params.toString()}`;
};

// The same test is compared across header groups (eg. desktop "fission
// webrender" and Android "webrender" share subtests), so the group is the
// suite/test/framework/revision rather than the header.
export const crossPlatformGroupKey = (result: CombinedResultsItemType) =>
  [result.suite, result.test, result.framework_id, result.new_rev].join('\0');

export const buildCrossPlatformLinks = (
  results: CombinedResultsItemType[],
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
): Map<string, string> => {
  const groups = new Map<string, CombinedResultsItemType[]>();
  for (const result of results) {
    const key = crossPlatformGroupKey(result);
    const group = groups.get(key);
    if (group) group.push(result);
    else groups.set(key, [result]);
  }
  const links = new Map<string, string>();
  for (const [key, group] of groups) {
    const link = getCrossPlatformSubtestsLink(
      group,
      testVersion,
      advancedColumns,
      expandedRow,
    );
    if (link) links.set(key, link);
  }
  return links;
};
