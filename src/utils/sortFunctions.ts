import { CombinedResultsItemType } from '../types/state';

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
