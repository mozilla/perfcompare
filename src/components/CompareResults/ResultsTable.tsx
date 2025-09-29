import { Suspense, useState } from 'react';
import { Suspense, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearchParams, useLoaderData, Await } from 'react-router';

import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsControls from './ResultsControls';
import TableContent from './TableContent';
import TableHeader from './TableHeader';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import useTableFilters from '../../hooks/useTableFilters';
import useTableSort from '../../hooks/useTableSort';
import { Framework } from '../../types/types';
import { CompareResultItemType, TestVersionName } from '../../types/state';
import { getTableConfigs, STUDENT_T } from '../../utils/helpers';



type CombinedLoaderReturnValue = LoaderReturnValue | OverTimeLoaderReturnValue;
export default function ResultsTable() {
  const {
    results: resultsPromise,
    view,
    frameworkId,
    generation,
    replicates,
  } = useLoaderData<CombinedLoaderReturnValue>();
  const [searchParams, setSearchParams] = useSearchParams();
  

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);
  const [testVersionVal, setTestVersionVal] = useState(STUDENT_T);

    // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(getTableConfigs(testVersionVal));
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort(getTableConfigs(testVersionVal));

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

  const onTestVersionChange = (testVersion: TestVersionName) => {
    rawSearchParams.set('test_version', testVersion);
    setTestVersionVal(testVersion);
    updateRawSearchParams(rawSearchParams);
  };

  const rowGridTemplateColumns = getTableConfigs(testVersionVal)
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
          testType={testVersionVal}
          resultsPromise={resultsPromise}
          onSearchTermChange={onSearchTermChange}
          onFrameworkChange={onFrameworkChange}
          onTestVersionChange={onTestVersionChange}
        />
        <TableHeader
          columnsConfiguration={getTableConfigs(testVersionVal)}
          filters={tableFilters}
          onToggleFilter={onToggleFilter}
          onClearFilter={onClearFilter}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onToggleSort={onToggleSort}
          testVersionVal={testVersionVal}
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
              columnsConfiguration={getTableConfigs(testVersionVal)}
              results={resolvedResults as CompareResultItemType[][]}
              view={view}
              replicates={replicates}
              rowGridTemplateColumns={rowGridTemplateColumns}
              filteringSearchTerm={searchTerm}
              tableFilters={tableFilters}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              testVersionVal={testVersionVal}
            />
          )}
        </Await>
      </Suspense>
    </Box>
  );
}
