import { Suspense, useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await } from 'react-router';

import SubtestsTableContent from './SubtestsTableContent';
import NoResultsFound from '.././NoResultsFound';
import TableHeader from '.././TableHeader';
import { STUDENT_T } from '../../../common/constants';
import useTableFilters, { filterResults } from '../../../hooks/useTableFilters';
import useTableSort, { sortResults } from '../../../hooks/useTableSort';
import type { CombinedResultsItemType, TestVersion } from '../../../types/types';
import {
  getColumnsConfiguration,
  getRowGridTemplateColumns,
} from '../../../utils/rowTemplateColumns';

type SubtestsResults = {
  key: string;
  // By construction, there should be only one item in the array. But if more
  // than one subtests share the same name, then there will be more than one item.
  // Can this happen? We're not sure.
  value: CombinedResultsItemType[];
};

function processResults(results: CombinedResultsItemType[]) {
  const processedResults = new Map<string, CombinedResultsItemType[]>();
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

const stringComparisonCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});
function defaultSortFunction(
  resultA: CombinedResultsItemType,
  resultB: CombinedResultsItemType,
) {
  return stringComparisonCollator.compare(resultA.test, resultB.test);
}

function resultMatchesSearchTerm(
  result: CombinedResultsItemType,
  lowerCasedSearchTerm: string,
) {
  return result.test.toLowerCase().includes(lowerCasedSearchTerm);
}

type ResultsTableProps = {
  filteringSearchTerm: string;
  resultsPromise:
    | CombinedResultsItemType[]
    | Promise<CombinedResultsItemType[]>;
  replicates: boolean;
  testVersion: TestVersion;
};

function SubtestsResultsTable({
  filteringSearchTerm,
  resultsPromise,
  replicates,
  testVersion,
}: ResultsTableProps) {
  const columnsConfiguration = getColumnsConfiguration(true, testVersion);
  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(columnsConfiguration);
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort(columnsConfiguration);

  const rowGridTemplateColumns = getRowGridTemplateColumns(true, testVersion);

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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 3,
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <Await resolve={resultsPromise}>
          {(results: CombinedResultsItemType[]) => {
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
                    replicates={replicates}
                    testVersion={testVersion ?? STUDENT_T}
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
