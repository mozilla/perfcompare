import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearchParams, useLoaderData, Await } from 'react-router';

import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsControls from './ResultsControls';
import TableContent from './TableContent';
import TableHeader from './TableHeader';
import { MANN_WHITNEY_U, STUDENT_T } from '../../common/constants';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import useTableFilters from '../../hooks/useTableFilters';
import useTableSort from '../../hooks/useTableSort';
import { CompareResultsItem, MannWhitneyResultsItem } from '../../types/state';
import { Framework } from '../../types/types';
import type {
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  TestVersion,
} from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';

const columnsConfiguration: CompareResultsTableConfig = [
  {
    name: 'Platform',
    filter: true,
    key: 'platform',
    gridWidth: '2fr',
    possibleValues: [
      { label: 'Windows', key: 'windows' },
      { label: 'macOS', key: 'osx' },
      { label: 'Linux', key: 'linux' },
      { label: 'Android', key: 'android' },
      { label: 'iOS', key: 'ios' },
    ],
    matchesFunction(result, valueKey) {
      const label = this.possibleValues.find(
        ({ key }) => key === valueKey,
      )?.label;
      const platformName = getPlatformShortName(result.platform);
      return platformName === label;
    },
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
    gridWidth: '1.5fr',
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
  // We use the real pixel value for the buttons, so that everything is improvement aligned.
  { key: 'buttons', gridWidth: `calc(3.5 * 34px)` }, // 2 or 3 buttons, so at least 3*34px, but give more so that it can "breathe"
  { key: 'expand', gridWidth: '34px' }, // 1 button
];

const columnsMannWhitneyConfiguration: CompareMannWhitneyResultsTableConfig = [
  {
    name: 'Platform',
    filter: true,
    key: 'platform',
    gridWidth: '1.5fr',
    possibleValues: [
      { label: 'Windows', key: 'windows' },
      { label: 'macOS', key: 'osx' },
      { label: 'Linux', key: 'linux' },
      { label: 'Android', key: 'android' },
      { label: 'iOS', key: 'ios' },
    ],
    matchesFunction(result, valueKey) {
      const label = this.possibleValues.find(
        ({ key }) => key === valueKey,
      )?.label;
      const platformName = getPlatformShortName(result.platform);
      return platformName === label;
    },
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
    gridWidth: '.5fr',
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
          return result.direction_of_change === 'improvement';
        case 'regression':
          return result.direction_of_change === 'regression';
        default:
          return (
            result.direction_of_change !== 'regression' &&
            result.direction_of_change !== 'improvement'
          );
      }
    },
  },
  {
    name: "Cliff's Delta",
    key: 'delta',
    gridWidth: '1fr',
    sortFunction(resultA, resultB) {
      return Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta);
    },
    tooltip:
      'Cliff’s Delta effect size quantifies the magnitude of the difference between Base and New values.',
  },
  {
    name: 'Confidence',
    key: 'confidence',
    gridWidth: '1.25fr',
    tooltip:
      'Mann Whitney U test p-value indicating statistical significance. Mann Whitney U p-value < .05 indicates a statistically significant difference between Base and New.',
    sortFunction(
      resultA: MannWhitneyResultsItem,
      resultB: MannWhitneyResultsItem,
    ) {
      if (
        !resultA.mann_whitney_test?.pvalue ||
        !resultB.mann_whitney_test?.pvalue
      ) {
        return 0;
      } else {
        return (
          Math.abs(resultA.mann_whitney_test.pvalue ?? 0) -
          Math.abs(resultB.mann_whitney_test.pvalue ?? 0)
        );
      }
    },
  },
  {
    name: 'Effect Size (%)',
    key: 'effects',
    gridWidth: '1.25fr',
    sortFunction(
      resultA: MannWhitneyResultsItem,
      resultB: MannWhitneyResultsItem,
    ) {
      if (!resultA.cles?.cles || !resultB.cles?.cles) {
        return 0;
      } else {
        return Math.abs(resultA.cles.cles) - Math.abs(resultB.cles.cles ?? 0);
      }
    },
    tooltip:
      'Common Language Effect Size (CLES) percentage is a measure of effect size. CLES >= 0.5 indicates probability Base > New.',
  },
  {
    name: 'Total Runs',
    key: 'runs',
    gridWidth: '1fr',
    tooltip: 'The total number of tasks/jobs that ran for this metric.',
  },
  // We use the real pixel value for the buttons, so that everything is improvement aligned.
  { key: 'buttons', gridWidth: 'calc(2.25 * 34px)' }, // 2 or 3 buttons, so at least 3*34px, but give more so that it can "breathe"
  { key: 'expand', gridWidth: '34px' }, // 1 button
];

type CombinedLoaderReturnValue = LoaderReturnValue | OverTimeLoaderReturnValue;
export default function ResultsTable() {
  const {
    results: resultsPromise,
    view,
    frameworkId,
    generation,
    replicates,
    testVersion,
  } = useLoaderData<CombinedLoaderReturnValue>();

  const [searchParams, setSearchParams] = useSearchParams();

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const [testVersionVal, setTestVersionVal] = useState<TestVersion>(
    testVersion ?? STUDENT_T,
  );

  const columnsConfig =
    testVersionVal === MANN_WHITNEY_U
      ? columnsMannWhitneyConfiguration
      : columnsConfiguration;

  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(columnsConfig);
  const { sortColumn, sortDirection, onToggleSort } = useTableSort(
    columnsConfig,
    testVersionVal,
  );

  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);

  const onFrameworkChange = (newFrameworkId: Framework['id']) => {
    setFrameworkIdVal(newFrameworkId);
    searchParams.set('framework', newFrameworkId.toString());
    setSearchParams(searchParams);
  };

  const onSearchTermChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if (newSearchTerm) {
      rawSearchParams.set('search', newSearchTerm);
    } else {
      rawSearchParams.delete('search');
    }
    updateRawSearchParams(rawSearchParams);
  };

  const onTestVersionChange = (testVersion: TestVersion): void => {
    setTestVersionVal(testVersion);
    searchParams.set('test_version', testVersion);
    setSearchParams(searchParams);
  };

  const getRowString = (testVersion: TestVersion) => {
    const rowGridTemplateColumns = (
      testVersion === MANN_WHITNEY_U
        ? columnsMannWhitneyConfiguration
        : columnsConfiguration
    )
      .map((config) => config.gridWidth)
      .join(' ');
    return rowGridTemplateColumns;
  };

  return (
    <Box data-testid='results-table' role='table' sx={{ paddingBottom: 3 }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'background.default',
        }}
      >
        <ResultsControls
          initialSearchTerm={initialSearchTerm}
          frameworkId={frameworkIdVal}
          testType={testVersionVal}
          resultsPromise={
            testVersion === MANN_WHITNEY_U
              ? (resultsPromise as Promise<MannWhitneyResultsItem[][]>)
              : (resultsPromise as Promise<CompareResultsItem[][]>)
          }
          onSearchTermChange={onSearchTermChange}
          onFrameworkChange={onFrameworkChange}
          onTestVersionChange={onTestVersionChange}
        />
        <TableHeader
          columnsConfiguration={columnsConfig}
          filters={tableFilters}
          onToggleFilter={onToggleFilter}
          onClearFilter={onClearFilter}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onToggleSort={onToggleSort}
        />
      </Box>
      {/* Using a key in Suspense makes it that it displays the fallback more
        consistently.
        See https://github.com/mozilla/perfcompare/pull/702#discussion_r1705274740
        for more explanation (and questioning) about this issue. */}
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
        key={generation}
      >
        <Await resolve={resultsPromise}>
          {(resolvedResults) => (
            <TableContent
              columnsConfiguration={columnsConfig}
              results={
                testVersionVal === MANN_WHITNEY_U
                  ? (resolvedResults as MannWhitneyResultsItem[][])
                  : (resolvedResults as CompareResultsItem[][])
              }
              view={view}
              replicates={replicates}
              rowGridTemplateColumns={getRowString(testVersionVal)}
              filteringSearchTerm={searchTerm}
              tableFilters={tableFilters}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              testVersion={testVersionVal}
            />
          )}
        </Await>
      </Suspense>
    </Box>
  );
}
