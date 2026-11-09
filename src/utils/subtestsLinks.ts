import { setAdvancedOptionsParams } from './advancedOptionsUrl';
import { preserveFakeDataParam } from '../logic/treeherder';
import type { CombinedResultsItemType } from '../types/state';
import type {
  AdvancedColumns,
  ExpandedRowOptions,
  TestVersion,
} from '../types/types';

export const getSubtestsCompareWithBaseLink = (
  result: CombinedResultsItemType,
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) => {
  const params = new URLSearchParams({
    baseRev: result.base_rev,
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
    test_version: testVersion,
  });
  // Open the subtests page with the same Advanced options.
  setAdvancedOptionsParams(params, advancedColumns, expandedRow, {
    explicit: true,
  });
  preserveFakeDataParam(params);

  return `/subtests-compare-results?${params.toString()}`;
};

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
