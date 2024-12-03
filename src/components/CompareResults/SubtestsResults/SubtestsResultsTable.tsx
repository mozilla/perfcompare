import { useMemo } from 'react';

import Box from '@mui/material/Box';

import SubtestsTableContent from './SubtestsTableContent';
import NoResultsFound from '.././NoResultsFound';
import TableHeader from '.././TableHeader';
import useTableFilters from '../../../hooks/useTableFilters';
import type { CompareResultsItem } from '../../../types/state';
import type { CompareResultsTableConfig } from '../../../types/types';

type SubtestsResults = {
  key: string;
  // By construction, there should be only one item in the array. But if more
  // than one subtests share the same name, then there will be more than one item.
  // Can this happen? We're not sure.
  value: CompareResultsItem[];
};

function processResults(results: CompareResultsItem[]) {
  const processedResults = new Map<string, CompareResultsItem[]>();
  results.forEach((result) => {
    const { header_name: header } = result;
    const processedResult = processedResults.get(header);
    if (processedResult) {
      processedResult.push(result);
    } else {
      processedResults.set(header, [result]);
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
    name: 'Delta',
    key: 'delta',
    gridWidth: '1fr',
    sortFunction(resultA, resultB) {
      return resultA.delta_percentage - resultB.delta_percentage;
    },
  },
  {
    name: 'Confidence',
    filter: true,
    key: 'confidence',
    gridWidth: '1.5fr',
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
    sortFunction(resultA, resultB) {
      const confidenceA =
        resultA.confidence_text && resultA.confidence !== null
          ? resultA.confidence
          : -1;
      const confidenceB =
        resultB.confidence_text && resultB.confidence !== null
          ? resultB.confidence
          : -1;
      return confidenceA - confidenceB;
    },
  },
  { name: 'Total Runs', key: 'runs', gridWidth: '1fr' },
  // The 2 icons are 24px wide, and they have 5px padding.
  { key: 'buttons', gridWidth: '34px' },
  { key: 'expand', gridWidth: '34px' },
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
  if (!cellConfiguration || !('filter' in cellConfiguration)) {
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
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(cellsConfiguration);

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
