import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearchParams } from 'react-router-dom';
import { useLoaderData, Await } from 'react-router-dom';

import useRawSearchParams from '../../hooks/useRawSearchParams';
import type { CompareResultsItem } from '../../types/state';
import { Framework } from '../../types/types';
import type { CompareResultsTableConfig } from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';
import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsControls from './ResultsControls';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

const cellsConfiguration: CompareResultsTableConfig = [
  {
    name: 'Platform',
    disable: true,
    filter: true,
    key: 'platform',
    gridWidth: '2fr',
    possibleValues: [
      { label: 'Windows', key: 'windows' },
      { label: 'OSX', key: 'osx' },
      { label: 'Linux', key: 'linux' },
      { label: 'Android', key: 'android' },
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
  {
    name: 'Total Runs',
    key: 'runs',

    gridWidth: '1fr',
  },
  { key: 'buttons', gridWidth: '2fr' },
  { key: 'expand', gridWidth: '0.2fr' },
];

export default function ResultsTable() {
  const {
    results: resultsPromise,
    view,
    frameworkId,
    generation,
  } = useLoaderData() as LoaderReturnValue | OverTimeLoaderReturnValue;
  const [searchParams, setSearchParams] = useSearchParams();

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);
  const [tableFilters, setTableFilters] = useState(
    new Map() as Map<string, Set<string>>, // ColumnID -> Set<Values to remove>
  );

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

  const rowGridTemplateColumns = cellsConfiguration
    .map((config) => config.gridWidth)
    .join(' ');

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
          resultsPromise={resultsPromise}
          onSearchTermChange={onSearchTermChange}
          onFrameworkChange={onFrameworkChange}
        />
        <TableHeader
          cellsConfiguration={cellsConfiguration}
          filters={tableFilters}
          onToggleFilter={onToggleFilter}
          onClearFilter={onClearFilter}
        />
      </Box>
      {/* Using a key in Suspense makes it that it displays the fallback more
        consistently.
        See https://github.com/mozilla/perfcompare/pull/702#discussion_r1705274740
        for more explanation (and questioning) about this issue. */}
      <Suspense
        fallback={
          <Box display='flex' justifyContent='center' sx={{ marginTop: 3 }}>
            <CircularProgress />
          </Box>
        }
        key={generation}
      >
        <Await resolve={resultsPromise}>
          {(resolvedResults) => (
            <TableContent
              cellsConfiguration={cellsConfiguration}
              results={resolvedResults as CompareResultsItem[][]}
              filteringSearchTerm={searchTerm}
              tableFilters={tableFilters}
              view={view}
              rowGridTemplateColumns={rowGridTemplateColumns}
            />
          )}
        </Await>
      </Suspense>
    </Box>
  );
}
