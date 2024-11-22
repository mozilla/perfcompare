import { useMemo } from 'react';

import Box from '@mui/material/Box';

import useTableFilters from '../../../hooks/useTableFilters';
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

const cellsConfiguration: CompareResultsTableConfig = [
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
    possibleValues: [
      { label: 'No changes', key: 'none' },
      { label: 'Improvement', key: 'improvement' },
      { label: 'Regression', key: 'regression' },
    ],
    matchesFunction(result, valueKey) {
      switch (valueKey) {
        case 'improvement':
          return result.is_improvement;
        case 'regression':
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
    possibleValues: [
      { label: 'No value', key: 'none' },
      { label: 'Low', key: 'low' },
      { label: 'Medium', key: 'medium' },
      { label: 'High', key: 'high' },
    ],
    matchesFunction(result, valueKey) {
      switch (valueKey) {
        case 'none':
          return !result.confidence_text;
        default: {
          const label = this.possibleValues.find(
            ({ key }) => key === valueKey,
          )?.label;
          return result.confidence_text === label;
        }
      }
    },
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

  for (const filterValue of uncheckedValues) {
    if (cellConfiguration.matchesFunction(result, filterValue)) {
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
  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } = useTableFilters();

  const processedResults = useMemo(() => {
    const filteredResults = filterResults(
      results,
      filteringSearchTerm,
      tableFilters,
    );
    return processResults(filteredResults);
  }, [results, filteringSearchTerm, tableFilters]);

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
