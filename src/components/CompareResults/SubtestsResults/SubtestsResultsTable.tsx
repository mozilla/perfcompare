import { Suspense, useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await } from 'react-router-dom';

import SubtestsTableContent from './SubtestsTableContent';
import NoResultsFound from '.././NoResultsFound';
import TableHeader from '.././TableHeader';
import useTableFilters, { filterResults } from '../../../hooks/useTableFilters';
import useTableSort, { sortResults } from '../../../hooks/useTableSort';
import type { CompareResultsItem } from '../../../types/state';
import type { CompareResultsTableConfig } from '../../../types/types';
import {
  defaultSortFunction,
  resultMatchesSearchTerm,
  processResults,
} from '../../../utils/subtestsUtils';

const columnsConfiguration: CompareResultsTableConfig = [
  {
    name: 'Subtests',
    key: 'subtests',
    gridWidth: '3fr',
    sortFunction: defaultSortFunction,
  },
  {
    name: 'Base',
    key: 'base',
    gridWidth: '1fr',
    tooltip: 'A summary of all values from Base runs using a mean.',
  },
  {
    key: 'comparisonSign',

    gridWidth: '0.2fr',
  },
  {
    name: 'New',
    key: 'new',

    gridWidth: '1fr',
    tooltip: 'A summary of all values from New runs using a mean.',
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
      return (
        Math.abs(resultA.delta_percentage) - Math.abs(resultB.delta_percentage)
      );
    },
    tooltip: 'The percentage difference between the Base and New values',
  },
  {
    name: 'Confidence',
    filter: true,
    key: 'confidence',
    gridWidth: '1.8fr',
    tooltip:
      "Calculated using a Student's T-test comparison. Low is anything under a T value of 3, Medium is between 3 and 5, and High is anything higher than 5.",
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
  {
    name: 'Total Runs',
    key: 'runs',
    gridWidth: '1fr',
    tooltip: 'The total number of tasks/jobs that ran for this metric.',
  },
  // The 2 icons are 24px wide, and they have 5px padding.
  { key: 'buttons', gridWidth: '34px' },
  { key: 'expand', gridWidth: '34px' },
];

type ResultsTableProps = {
  filteringSearchTerm: string;
  resultsPromise: CompareResultsItem[] | Promise<CompareResultsItem[]>;
};

function SubtestsResultsTable({
  filteringSearchTerm,
  resultsPromise,
}: ResultsTableProps) {
  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(columnsConfiguration);
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort(columnsConfiguration);

  const rowGridTemplateColumns = columnsConfiguration
    .map((config) => config.gridWidth)
    .join(' ');

  return (
    <Box
      data-testid='subtests-results-table'
      role='table'
      sx={{ marginTop: 3, paddingBottom: 3 }}
    >
      {/* Using the same TableHeader component as the CompareResults components but with different columnsConfiguration */}
      <TableHeader
        columnsConfiguration={columnsConfiguration}
        filters={tableFilters}
        onToggleFilter={onToggleFilter}
        onClearFilter={onClearFilter}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onToggleSort={onToggleSort}
      />

      <Suspense
        fallback={
          <Box display='flex' justifyContent='center' sx={{ marginTop: 3 }}>
            <CircularProgress />
          </Box>
        }
      >
        <Await resolve={resultsPromise}>
          {(results: CompareResultsItem[]) => {
            const filteredResults = useMemo(() => {
              return filterResults(
                columnsConfiguration,
                results,
                filteringSearchTerm,
                tableFilters,
                resultMatchesSearchTerm,
              );
            }, [results, filteringSearchTerm, tableFilters]);

            const filteredAndSortedResults = useMemo(() => {
              return sortResults(
                columnsConfiguration,
                filteredResults,
                sortColumn,
                sortDirection,
                defaultSortFunction,
              );
            }, [filteredResults, sortColumn, sortDirection]);

            const processedResults = useMemo(() => {
              return processResults(filteredAndSortedResults);
            }, [filteredAndSortedResults]);

            if (processedResults.length === 0) {
              return <NoResultsFound />;
            }

            return (
              <>
                {processedResults.map((res) => (
                  <SubtestsTableContent
                    key={res.key}
                    identifier={res.key}
                    results={res.value}
                    rowGridTemplateColumns={rowGridTemplateColumns}
                  />
                ))}
              </>
            );
          }}
        </Await>
      </Suspense>
    </Box>
  );
}

export default SubtestsResultsTable;
