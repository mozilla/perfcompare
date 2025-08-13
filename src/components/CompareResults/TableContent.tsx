import { useMemo, memo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import NoResultsFound from './NoResultsFound';
import TableRevisionContent from './TableRevisionContent';
import type { compareView, compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { filterResults } from '../../hooks/useTableFilters';
import { sortResults } from '../../hooks/useTableSort';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import type { CompareResultsTableConfig } from '../../types/types';

// The data structure returned by processResults may look complex at first, so
// here are some extra explanation.
// In short it's a list of results, grouped first by tests, and then by revisions.
// This mimics the view we want to generate in the results page.
// We're using plain arrays to make it easier to iterate. This way the arrays are
// generated just once. There are 2 types of arrays in this structure:
// * the arrays that can grow with more results, more revisions, and more tests;
// * and the arrays of only 2 elements, that represent a key with its value.
// The arrays of the first type contain tuples, whose value is another array.
//
// Here is how this can look like:
// results = [
//   [ "header test 1", [
//     [ "revision1", [
//       { ...result1 },
//       { ...result2 },
//       ...
//     ]],
//     [ "revision2, [
//       ...
//     ]],
//  ]],
//  ["header test 2", [ ... ]],
//  ["header test 3", [ ... ]],
// ];

// This is the partial type that only contains the list of results grouped by revision.
//                                        revision      list of results for one test and revision
//                                              |               |
//                                              v               v
type ListOfResultsGroupedByRevisions = Array<[string, CompareResultsItem[]]>;

// This is the full type containing the list of all results grouped by test
// first, and by revisions second.
//  Test header (test name, options, etc)  All results for this header
//     |                                    |
//     v                                    v
type ListOfResultsGroupedByTest = Array<
  [string, ListOfResultsGroupedByRevisions]
>;

function processResults(
  results: CompareResultsItem[],
): ListOfResultsGroupedByTest {
  // This map will make it possible to group all results by test header first,
  // and by revision then.
  // Map<header, Map<revision, array of results>>
  const processedResults: Map<
    string,
    Map<string, CompareResultsItem[]>
  > = new Map();

  for (const result of results) {
    const { new_rev: newRevision, header_name: header } = result;

    let resultsForHeader = processedResults.get(header);
    if (!resultsForHeader) {
      resultsForHeader = new Map();
      processedResults.set(header, resultsForHeader);
    }

    const resultsForRevision = resultsForHeader.get(newRevision);
    if (!resultsForRevision) {
      resultsForHeader.set(newRevision, [result]);
    } else {
      resultsForRevision.push(result);
    }
  }

  // This command converts the Map of maps in an array of arrays.
  return Array.from(processedResults, ([header, resultsForHeader]) => [
    header,
    [...resultsForHeader],
  ]);
}

// This function implements the simple string search. It is passed to filterResults.
// searchTerm needs to be lowerCased already.
function resultMatchesSearchTerm(
  result: CompareResultsItem,
  lowerCasedSearchTerm: string,
) {
  return (
    result.suite.toLowerCase().includes(lowerCasedSearchTerm) ||
    result.extra_options.toLowerCase().includes(lowerCasedSearchTerm) ||
    result.option_name.toLowerCase().includes(lowerCasedSearchTerm) ||
    result.test.toLowerCase().includes(lowerCasedSearchTerm) ||
    result.new_rev.toLowerCase().includes(lowerCasedSearchTerm) ||
    result.platform.toLowerCase().includes(lowerCasedSearchTerm)
  );
}

const stringComparisonCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});
// The default sort orders by header_name (which is a concatenation of suite,
// test and options), and platform, so that the order is stable when reloading
// the page.
function defaultSortFunction(
  itemA: CompareResultsItem,
  itemB: CompareResultsItem,
) {
  const keyA = itemA.header_name + ' ' + itemA.platform;
  const keyB = itemB.header_name + ' ' + itemB.platform;
  return stringComparisonCollator.compare(keyA, keyB);
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

type Props = {
  columnsConfiguration: CompareResultsTableConfig;
  results: CompareResultsItem[][];
  view: typeof compareView | typeof compareOverTimeView;
  rowGridTemplateColumns: string;
  // Filtering properties
  filteringSearchTerm: string;
  tableFilters: Map<string, Set<string>>; // ColumnID -> Set<Values to remove>
  // Sort properties
  sortColumn: null | string;
  sortDirection: 'asc' | 'desc' | null;
  replicates: boolean;
};

function TableContent({
  columnsConfiguration,
  results,
  view,
  rowGridTemplateColumns,
  filteringSearchTerm,
  tableFilters,
  sortColumn,
  sortDirection,
  replicates,
}: Props) {
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const filteredResults = useMemo(() => {
    const resultsForCurrentComparison =
      activeComparison === allRevisionsOption
        ? results.flat()
        : (results.find((result) => result[0].new_rev === activeComparison) ??
          []);

    const filteredResults = filterResults(
      columnsConfiguration,
      resultsForCurrentComparison,
      filteringSearchTerm,
      tableFilters,
      resultMatchesSearchTerm,
    );
    return filteredResults;
  }, [
    results,
    activeComparison,
    filteringSearchTerm,
    tableFilters,
    columnsConfiguration,
  ]);

  const sortedResults = useMemo(() => {
    return sortResults(
      columnsConfiguration,
      filteredResults,
      sortColumn,
      sortDirection,
      defaultSortFunction,
    );
  }, [columnsConfiguration, filteredResults, sortColumn, sortDirection]);

  const processedResults = useMemo(() => {
    return processResults(sortedResults);
  }, [sortedResults]);

  if (!filteredResults.length) {
    return <NoResultsFound />;
  }
  return (
    <Virtuoso
      useWindowScroll
      totalCount={processedResults.length}
      overscan={{
        /* These values are pretty arbitrary. The goal is to have more rows
         * rendered than the current viewport, so that when scrolling fast
         * (but not too fast) the white checkerboarding doesn't appear.
         */
        main: 5000,
        reverse: 5000,
      }}
      data={processedResults}
      computeItemKey={(_, [header]) => header}
      itemContent={(_, [, resultsForHeader]) => (
        <TableRevisionContent
          results={resultsForHeader}
          view={view}
          rowGridTemplateColumns={rowGridTemplateColumns}
          replicates={replicates}
        />
      )}
    />
  );
}

export default memo(TableContent);
