import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';

import type { CompareResultsItem } from '../../../types/state';
import type { CompareResultsTableConfig } from '../../../types/types';
import NoResultsFound from '.././NoResultsFound';
import TableHeader from '.././TableHeader';
import SubtestsTableContent from './SubtestsTableContent';

type SubtestsResults = {
  key: string;
  value: CompareResultsItem[];
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
  const restructuredResults: SubtestsResults[] = Array.from(
    processedResults,
    function ([rowIdentifier, result]) {
      return {
        key: rowIdentifier,
        value: result,
      };
    },
  );

  return restructuredResults;
}

const cellsConfiguration: CompareResultsTableConfig[] = [
  {
    name: 'Subtests',
    key: 'subtests',
    gridWidth: '4fr',
  },
  {
    name: 'Base',
    key: 'base',
    gridWidth: '1fr',
  },
  {
    key: 'comparisonSign',

    gridWidth: '0.2fr',
  },
  {
    name: 'New',
    key: 'new',

    gridWidth: '1fr',
  },
  {
    name: 'Status',
    disable: true,
    filter: true,
    key: 'status',
    gridWidth: '1.5fr',
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
    gridWidth: '1fr',
  },
  {
    name: 'Confidence',
    disable: true,
    filter: true,
    key: 'confidence',
    gridWidth: '1fr',
    possibleValues: ['Low', 'Medium', 'High'],
    matchesFunction: (result: CompareResultsItem, value: string) =>
      result.confidence_text === value,
  },
  { name: 'Total Runs', key: 'runs', gridWidth: '1fr' },
  { key: 'buttons', gridWidth: '1fr' },
  { key: 'expand', gridWidth: '0.2fr' },
];

function resultMatchesSearchTerm(
  result: CompareResultsItem,
  searchTerm: string,
) {
  return result.test.toLowerCase().includes(searchTerm.toLowerCase());
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

type ResultsTableProps = {
  filteringSearchTerm: string;
  results: CompareResultsItem[];
};

function SubtestsResultsTable({
  filteringSearchTerm,
  results,
}: ResultsTableProps) {
  const [tableFilters, setTableFilters] = useState(
    new Map() as Map<string, Set<string>>, // ColumnID -> Set<Values to remove>
  );

  const processedResults = useMemo(() => {
    const filteredResults = filterResults(
      results,
      filteringSearchTerm,
      tableFilters,
    );
    return processResults(filteredResults);
  }, [results, filteringSearchTerm, tableFilters]);

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

  const rowGridTemplateColumns = cellsConfiguration
    .map((config) => config.gridWidth)
    .join(' ');

  return (
    <Box
      data-testid='subtests-results-table'
      role='table'
      sx={{ marginTop: 3, paddingBottom: 3 }}
    >
      {/* Using the same TableHeader component as the CompareResults components but with different cellsConfiguration */}
      <TableHeader
        cellsConfiguration={cellsConfiguration}
        filters={tableFilters}
        onToggleFilter={onToggleFilter}
        onClearFilter={onClearFilter}
      />
      {processedResults.map((res) => (
        <SubtestsTableContent
          key={res.key}
          identifier={res.key}
          results={res.value}
          rowGridTemplateColumns={rowGridTemplateColumns}
        />
      ))}

      {processedResults.length == 0 && <NoResultsFound />}
    </Box>
  );
}

export default SubtestsResultsTable;
