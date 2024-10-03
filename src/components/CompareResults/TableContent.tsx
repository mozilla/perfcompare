import { useMemo, memo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import type { compareView, compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import type { CompareResultsTableConfig } from '../../types/types';
import NoResultsFound from './NoResultsFound';
import TableRevisionContent from './TableRevisionContent';

type ResultsForRevision = {
  key: string;
  value: CompareResultsItem[];
  revisionHeader: RevisionsHeader;
};

function processResults(results: CompareResultsItem[]) {
  const processedResults: Map<string, CompareResultsItem[]> = new Map<
    string,
    CompareResultsItem[]
  >();
  results.forEach((result) => {
    const { new_rev: newRevision, header_name: header } = result;
    const rowIdentifier = header.concat(' ', newRevision);
    if (processedResults.has(rowIdentifier)) {
      (processedResults.get(rowIdentifier) as CompareResultsItem[]).push(
        result,
      );
    } else {
      processedResults.set(rowIdentifier, [result]);
    }
  });
  const restructuredResults: ResultsForRevision[] = Array.from(
    processedResults,
    function ([rowIdentifier, result]) {
      return {
        key: rowIdentifier,
        value: result,
        revisionHeader: {
          suite: result[0].suite,
          framework_id: result[0].framework_id,
          test: result[0].test,
          option_name: result[0].option_name,
          extra_options: result[0].extra_options,
          new_rev: result[0].new_rev,
          new_repo: result[0].new_repository_name,
        },
      };
    },
  );

  return restructuredResults;
}

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

function resultMatchesColumnFilter(
  cellsConfiguration: CompareResultsTableConfig[],
  result: CompareResultsItem,
  columnId: string,
  uncheckedValues: Set<string>,
): boolean {
  const cellConfiguration = cellsConfiguration.find(
    (cell) => cell.key === columnId,
  );
  if (!cellConfiguration || !cellConfiguration.filter) {
    return true;
  }

  const { matchesFunction } = cellConfiguration;
  for (const filterValue of uncheckedValues) {
    if (matchesFunction(result, filterValue)) {
      return true;
    }
  }
  return false;
}

// This function filters the results array using both the searchTerm and the
// tableFilters. The tableFilters is a map ColumnID -> Set of values to remove.
function filterResults(
  cellsConfiguration: CompareResultsTableConfig[],
  results: CompareResultsItem[],
  searchTerm: string,
  tableFilters: Map<string, Set<string>>,
) {
  if (!searchTerm && !tableFilters.size) {
    return results;
  }

  return results.filter((result) => {
    if (!resultMatchesSearchTerm(result, searchTerm)) {
      return false;
    }

    for (const [columnId, uncheckedValues] of tableFilters) {
      if (
        resultMatchesColumnFilter(
          cellsConfiguration,
          result,
          columnId,
          uncheckedValues,
        )
      ) {
        return false;
      }
    }

    return true;
  });
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

type Props = {
  cellsConfiguration: CompareResultsTableConfig[];
  results: CompareResultsItem[][];
  filteringSearchTerm: string;
  tableFilters: Map<string, Set<string>>; // ColumnID -> Set<Values to remove>
  view: typeof compareView | typeof compareOverTimeView;
  rowGridTemplateColumns: string;
};

function TableContent({
  cellsConfiguration,
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
        : results.find((result) => result[0].new_rev === activeComparison) ??
          [];

    const filteredResults = filterResults(
      cellsConfiguration,
      resultsForCurrentComparison,
      filteringSearchTerm,
      tableFilters,
    );
    return processResults(filteredResults);
  }, [
    results,
    activeComparison,
    filteringSearchTerm,
    tableFilters,
    cellsConfiguration,
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
      computeItemKey={(_, res) => res.key}
      itemContent={(_, res) => (
        <TableRevisionContent
          identifier={res.key}
          header={res.revisionHeader}
          results={res.value}
          view={view}
          rowGridTemplateColumns={rowGridTemplateColumns}
        />
      )}
    />
  );
}

export default memo(TableContent);
