import { useMemo, useState, memo } from 'react';

import Box from '@mui/material/Box';
import { Virtuoso } from 'react-virtuoso';

import type { compareView, compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import type { CompareResultsTableConfig } from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';
import NoResultsFound from './NoResultsFound';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

type Results = {
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
  const restructuredResults: Results[] = Array.from(
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

const cellsConfiguration: CompareResultsTableConfig[] = [
  {
    name: 'Platform',
    disable: true,
    filter: true,
    key: 'platform',
    possibleValues: ['Windows', 'OSX', 'Linux', 'Android'],
    gridWidth: '2fr',
    matchesFunction: (result: CompareResultsItem, value: string) => {
      const platformName = getPlatformShortName(result.platform);
      return platformName === value;
    },
  },
  {
    name: 'Base',
    key: 'base',
  },
  { key: 'comparisonSign' },
  { name: 'New', key: 'new' },
  {
    name: 'Status',
    disable: true,
    filter: true,
    key: 'status',
    possibleValues: ['No changes', 'Improvement', 'Regression'],
    matchesFunction: (result: CompareResultsItem, value: string) => {
      switch (value) {
        case 'Improvement':
          return result.is_improvement;
        case 'Regression':
          return result.is_regression;
        default:
          return !result.is_improvement && !result.is_regression;
      }
    },
  },
  {
    name: 'Delta(%)',
    key: 'delta',
  },
  {
    name: 'Confidence',
    disable: true,
    filter: true,
    key: 'confidence',
    possibleValues: ['Low', 'Medium', 'High'],
    matchesFunction: (result: CompareResultsItem, value: string) =>
      result.confidence_text === value,
  },
  { name: 'Total Runs', key: 'runs' },
  { key: 'buttons' },
  { key: 'expand' },
];

function resultMatchesSearchTerm(
  result: CompareResultsItem,
  searchTerm: string,
) {
  return (
    result.suite.includes(searchTerm) ||
    result.extra_options.includes(searchTerm) ||
    result.option_name.includes(searchTerm) ||
    result.test.includes(searchTerm) ||
    result.new_rev.includes(searchTerm) ||
    result.platform.includes(searchTerm)
  );
}

function resultMatchesColumnFilter(
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
      if (resultMatchesColumnFilter(result, columnId, uncheckedValues)) {
        return false;
      }
    }

    return true;
  });
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

type ResultsTableProps = {
  filteringSearchTerm: string;
  results: CompareResultsItem[][];
  view: typeof compareView | typeof compareOverTimeView;
};

function ResultsTable({
  filteringSearchTerm,
  results,
  view,
}: ResultsTableProps) {
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const [tableFilters, setTableFilters] = useState(
    new Map() as Map<string, Set<string>>, // ColumnID -> Set<Values to remove>
  );

  const processedResults = useMemo(() => {
    const resultsForCurrentComparison =
      activeComparison === allRevisionsOption
        ? results.flat()
        : results.find((result) => result[0].new_rev === activeComparison) ??
          [];

    const filteredResults = filterResults(
      resultsForCurrentComparison,
      filteringSearchTerm,
      tableFilters,
    );
    return processResults(filteredResults);
  }, [results, activeComparison, filteringSearchTerm, tableFilters]);

  const onClearFilter = (columnId: string) => {
    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.delete(columnId);
      return newFilters;
    });
  };

  const onToggleFilter = (columnId: string, filters: Set<string>) => {
    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.set(columnId, filters);
      return newFilters;
    });
  };

  return (
    <Box
      data-testid='results-table'
      role='table'
      sx={{ marginTop: 3, paddingBottom: 3 }}
    >
      <TableHeader
        cellsConfiguration={cellsConfiguration}
        filters={tableFilters}
        onToggleFilter={onToggleFilter}
        onClearFilter={onClearFilter}
      />
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
          <TableContent
            identifier={res.key}
            header={res.revisionHeader}
            results={res.value}
            view={view}
          />
        )}
      />

      {processedResults.length == 0 && <NoResultsFound />}
    </Box>
  );
}

export default memo(ResultsTable);
