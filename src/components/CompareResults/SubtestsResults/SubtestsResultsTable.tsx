import { Suspense, useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await } from 'react-router';

import SubtestsTableContent from './SubtestsTableContent';
import NoResultsFound from '.././NoResultsFound';
import TableHeader from '.././TableHeader';
import useTableFilters, { filterResults } from '../../../hooks/useTableFilters';
import useTableSort, { sortResults } from '../../../hooks/useTableSort';
import type { CompareResultsItem, MannWhitneyResultsItem } from '../../../types/state';
import type {
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  TestVersion,
} from '../../../types/types';
import { MANN_WHITNEY_U } from '../../../common/constants';

type SubtestsResults = {
  key: string;
  // By construction, there should be only one item in the array. But if more
  // than one subtests share the same name, then there will be more than one item.
  // Can this happen? We're not sure.
  value: (CompareResultsItem | MannWhitneyResultsItem)[];
};

function processResults(results: (CompareResultsItem | MannWhitneyResultsItem)[]) {
  const processedResults = new Map<string, (CompareResultsItem | MannWhitneyResultsItem)[]>();
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
  resultA: CompareResultsItem | MannWhitneyResultsItem,
  resultB: CompareResultsItem | MannWhitneyResultsItem,
) {
  return stringComparisonCollator.compare(resultA.test, resultB.test);
}

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

const columnsMannWhitneyConfiguration: CompareMannWhitneyResultsTableConfig = [
  {
    name: 'Subtests',
    key: 'subtests',
    gridWidth: '1.5fr',
    sortFunction: defaultSortFunction,
  },
  {
    name: 'Base',
    key: 'base',
    gridWidth: '.5fr',
    tooltip: 'A summary of all values from Base runs using a mean.',
  },
  {
    key: 'comparisonSign',

    gridWidth: '0.2fr',
  },
  {
    name: 'New',
    key: 'new',

    gridWidth: '.75fr',
    tooltip: 'A summary of all values from New runs using a mean.',
  },
  {
    name: 'Status',
    filter: true,
    key: 'status',
    gridWidth: '1fr',
    possibleValues: [
      { label: 'No changes', key: 'none' },
      { label: 'Improvement', key: 'improvement' },
      { label: 'Regression', key: 'regression' },
    ],
    matchesFunction(result, valueKey) {
      switch (valueKey) {
        case 'improvement':
          return result.direction_of_change === 'better';
        case 'regression':
          return result.direction_of_change === 'worse';
        default:
          return false;
      }
    },
  },
  {
    name: "Cliff's Delta",
    key: 'cliffs_delta',
    gridWidth: '1.25fr',
    sortFunction(resultA, resultB) {
      return (
        Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta)
      );
    },
    tooltip: 'Cliff’s Delta effect size quantifies the magnitude of the difference between Base and New values.',
  },
  {
    name: 'Confidence',
    filter: true,
    key: 'confidence',
    gridWidth: '1fr',
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
        resultA?.cles?.cles && resultA?.cles?.cles !== null
          ? resultA?.cles?.cles
          : -1;
      const confidenceB =
        resultB?.cles?.cles && resultB?.cles?.cles !== null
          ? resultB?.cles?.cles
          : -1;
      return confidenceA - confidenceB;
    },
  },
  {
    name: "Effect Size (%)",
    key: 'effect_size',
    gridWidth: '1.25fr',
    sortFunction(resultA: MannWhitneyResultsItem, resultB: MannWhitneyResultsItem) {
      if(!resultA.mann_whitney_test?.pvalue || !resultB.mann_whitney_test?.pvalue) {
        return 0;
      }else{
      return (Math.abs(resultA.mann_whitney_test.pvalue) - Math.abs(resultB.mann_whitney_test.pvalue?? 0));
      }
      
    },
    tooltip: 'Mann Whitney U test p-value indicating statistical significance.',
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

function resultMatchesSearchTerm(
  result: CompareResultsItem | MannWhitneyResultsItem,
  lowerCasedSearchTerm: string,
) {
  return result.test.toLowerCase().includes(lowerCasedSearchTerm);
}

type ResultsTableProps = {
  filteringSearchTerm: string;
  resultsPromise: (CompareResultsItem | MannWhitneyResultsItem)[] | Promise<(CompareResultsItem | MannWhitneyResultsItem)[]>;
  replicates: boolean;
  testVersion?: TestVersion;
};

function SubtestsResultsTable({
  filteringSearchTerm,
  resultsPromise,
  replicates,
  testVersion,
}: ResultsTableProps) {
  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters((testVersion === MANN_WHITNEY_U ? columnsMannWhitneyConfiguration : columnsConfiguration));
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort((testVersion === MANN_WHITNEY_U ? columnsMannWhitneyConfiguration : columnsConfiguration));

  const rowGridTemplateColumns = (testVersion === MANN_WHITNEY_U ? columnsMannWhitneyConfiguration : columnsConfiguration)
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
        columnsConfiguration={testVersion === MANN_WHITNEY_U ? columnsMannWhitneyConfiguration : columnsConfiguration}
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
          {(results: (CompareResultsItem | MannWhitneyResultsItem)[]) => {
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
                filteredResults as CompareResultsItem[],
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
                    testVersion={testVersion}
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
