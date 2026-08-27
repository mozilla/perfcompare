import { Suspense, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoaderData, Await, useSearchParams } from 'react-router';

import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsControls from './ResultsControls';
import TableContent from './TableContent';
import TableHeader from './TableHeader';
import { MANN_WHITNEY_U } from '../../common/constants';
import useAdvancedColumns from '../../hooks/useAdvancedColumns';
import useInitializeTableStateFromCookies from '../../hooks/useInitializeTableStateFromCookies';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import useSeedAdvancedColumnsFromUrl from '../../hooks/useSeedAdvancedColumnsFromUrl';
import useTableFilters from '../../hooks/useTableFilters';
import useTableSort from '../../hooks/useTableSort';
import { Framework, TestVersion } from '../../types/types';
import {
  getColumnsConfiguration,
  toGridTemplateColumns,
} from '../../utils/rowTemplateColumns';
import { currentUrlParams } from '../../utils/tableStatePersistence';

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

  const [, setSearchParams] = useSearchParams();

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  useSeedAdvancedColumnsFromUrl();
  const advancedColumns = useAdvancedColumns();

  const columnsConfig = useMemo(
    () =>
      getColumnsConfiguration(
        false,
        testVersion ?? MANN_WHITNEY_U,
        advancedColumns,
      ),
    [testVersion, advancedColumns],
  );

  // On a fresh (uninitialized) URL, seed filter/sort from cookies into the URL
  // and mark it initialized, so shared links reproduce the same view.
  useInitializeTableStateFromCookies(columnsConfig);

  // This is our custom hook that manages table filters
  // and provides methods for clearing and toggling them.
  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(columnsConfig);
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort(columnsConfig);

  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [frameworkIdVal, setFrameworkIdVal] = useState(frameworkId);
  const [testVersionVal, setTestVersionVal] = useState<TestVersion>(
    testVersion ?? MANN_WHITNEY_U,
  );
  const [expandAll, setExpandAll] = useState(false);

  // These writers build from the *live* URL (currentUrlParams) rather than a
  // render-time snapshot, so they preserve params written out-of-band — most
  // importantly the `initialized` marker and cookie-seeded filter/sort — that a
  // stale snapshot would drop (see useRawSearchParams / tableStatePersistence).
  const onFrameworkChange = (newFrameworkId: Framework['id']) => {
    setFrameworkIdVal(newFrameworkId);
    const params = currentUrlParams();
    params.set('framework', newFrameworkId.toString());
    setSearchParams(params);
  };

  const onSearchTermChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    const params = currentUrlParams();
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    updateRawSearchParams(params);
  };

  const onTestVersionChange = (testVersion: TestVersion): void => {
    setTestVersionVal(testVersion);
    const params = currentUrlParams();
    params.set('test_version', testVersion);
    if (testVersion !== MANN_WHITNEY_U) {
      params.delete('replicates');
    }
    setSearchParams(params);
  };

  const rowGridTemplateColumns = toGridTemplateColumns(columnsConfig);

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
          expandAll={expandAll}
          onSearchTermChange={onSearchTermChange}
          onFrameworkChange={onFrameworkChange}
          onTestVersionChange={onTestVersionChange}
          onExpandAllChange={setExpandAll}
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
              results={resolvedResults}
              view={view}
              replicates={replicates}
              rowGridTemplateColumns={rowGridTemplateColumns}
              filteringSearchTerm={searchTerm}
              tableFilters={tableFilters}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              testVersion={testVersion ?? MANN_WHITNEY_U}
              expandAll={expandAll}
            />
          )}
        </Await>
      </Suspense>
    </Box>
  );
}
