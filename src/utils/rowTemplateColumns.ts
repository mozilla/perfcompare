import { buildColumnsForVersion } from './columnBuilders';
import { getTableLayoutConfig } from './tableConfigs';
import { CombinedResultsItemType } from '../types/state';
import {
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  TestVersion,
} from '../types/types';

export const stringComparisonCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

// The default sort orders by header_name (which is a concatenation of suite,
// test and options), and platform, so that the order is stable when reloading
// the page.
export function defaultSortFunction(
  itemA: CombinedResultsItemType,
  itemB: CombinedResultsItemType,
) {
  const keyA = itemA.header_name + ' ' + itemA.platform;
  const keyB = itemB.header_name + ' ' + itemB.platform;
  return stringComparisonCollator.compare(keyA, keyB);
}

export function defaultSortSubtestFunction(
  resultA: CombinedResultsItemType,
  resultB: CombinedResultsItemType,
) {
  return stringComparisonCollator.compare(resultA.test, resultB.test);
}

/**
 * Get column configuration based on test version and table type (main/subtest).
 * This function uses the column builder pattern to generate the appropriate
 * configuration for each test version without code duplication.
 *
 * @param isSubtestTable - Whether this is a subtest table or main results table
 * @param testVersion - The statistical test version ('student-t' or 'mann-whitney-u')
 * @returns Column configuration array for the specified test version
 */
export const getColumnsConfiguration = (
  isSubtestTable: boolean,
  testVersion: TestVersion,
): CompareResultsTableConfig | CompareMannWhitneyResultsTableConfig => {
  const layoutConfig = getTableLayoutConfig(testVersion, isSubtestTable);
  return buildColumnsForVersion(testVersion, layoutConfig);
};
