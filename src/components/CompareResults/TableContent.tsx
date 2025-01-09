import { useMemo, memo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import NoResultsFound from './NoResultsFound';
import TableRevisionContent from './TableRevisionContent';
import type { compareView, compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { filterResults } from '../../hooks/useTableFilters';
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

// This function implements the simple string search. It is passed to
// filterResults.
function resultMatchesSearchTerm(
  result: CompareResultsItem,
  searchTerm: string,
) {
  searchTerm = searchTerm.toLowerCase();
  return (
    result.suite.toLowerCase().includes(searchTerm) ||
    result.extra_options.toLowerCase().includes(searchTerm) ||
    result.option_name.toLowerCase().includes(searchTerm) ||
    result.test.toLowerCase().includes(searchTerm) ||
    result.new_rev.toLowerCase().includes(searchTerm) ||
    result.platform.toLowerCase().includes(searchTerm)
  );
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

type Props = {
  columnsConfiguration: CompareResultsTableConfig;
  results: CompareResultsItem[][];
  filteringSearchTerm: string;
  tableFilters: Map<string, Set<string>>; // ColumnID -> Set<Values to remove>
  view: typeof compareView | typeof compareOverTimeView;
  rowGridTemplateColumns: string;
};

function TableContent({
  columnsConfiguration,
  results,
  filteringSearchTerm,
  tableFilters,
  view,
  rowGridTemplateColumns,
}: Props) {
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const processedResults = useMemo(() => {
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
    return processResults(filteredResults);
  }, [
    results,
    activeComparison,
    filteringSearchTerm,
    tableFilters,
    columnsConfiguration,
  ]);

  if (!processedResults.length) {
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
        />
      )}
    />
  );
}

export default memo(TableContent);
