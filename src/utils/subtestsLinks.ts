import type { CombinedResultsItemType } from '../types/state';
import { TestVersion } from '../types/types';

export const getSubtestsCompareWithBaseLink = (
  result: CombinedResultsItemType,
  testVersion: TestVersion,
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

  return `/subtests-compare-results?${params.toString()}`;
};

// Builds the link to the cross-platform subtests page for a whole test group:
// one baseParentSignature/newParentSignature/platform triplet per platform row
// that actually has subtests. Returns null when no row has subtests.
export const getCrossPlatformSubtestsLink = (
  results: CombinedResultsItemType[],
  testVersion: TestVersion,
): string | null => {
  const rowsWithSubtests = results.filter((result) => result.has_subtests);
  if (rowsWithSubtests.length === 0) {
    return null;
  }

  const firstResult = rowsWithSubtests[0];
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

  return `/subtests-cross-platform-results?${params.toString()}`;
};

// Rows of the same test can land in different header groups on the main page
// (eg. desktop runs with "fission webrender" while Android runs with just
// "webrender", or firefox vs fenix), yet they're the same subtests and should be
// compared together. So the cross-platform link is built per suite/test/new
// revision rather than per header group; this key identifies such a set.
export const crossPlatformGroupKey = (result: CombinedResultsItemType) =>
  `${result.suite}\u0000${result.test}\u0000${result.new_rev}`;

// Builds every cross-platform link for a list of results, keyed by
// crossPlatformGroupKey. Groups where no row has subtests are left out.
export const buildCrossPlatformLinks = (
  results: CombinedResultsItemType[],
  testVersion: TestVersion,
): Map<string, string> => {
  const groups = new Map<string, CombinedResultsItemType[]>();
  for (const result of results) {
    const key = crossPlatformGroupKey(result);
    const group = groups.get(key);
    if (group) {
      group.push(result);
    } else {
      groups.set(key, [result]);
    }
  }

  const links = new Map<string, string>();
  for (const [key, group] of groups) {
    const link = getCrossPlatformSubtestsLink(group, testVersion);
    if (link) {
      links.set(key, link);
    }
  }
  return links;
};
