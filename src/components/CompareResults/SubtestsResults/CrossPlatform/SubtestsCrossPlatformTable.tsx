import { Suspense, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await } from 'react-router';

import SubtestsCrossPlatformRow from './SubtestsCrossPlatformRow';
import { tooltipAgreement } from '../../../../common/constants';
import useInitializeTableStateFromCookies from '../../../../hooks/useInitializeTableStateFromCookies';
import useTableFilters from '../../../../hooks/useTableFilters';
import useTableSort from '../../../../hooks/useTableSort';
import { Strings } from '../../../../resources/Strings';
import type { TestVersion } from '../../../../types/types';
import { toGridTemplateColumns } from '../../../../utils/gridTemplateColumns';
import {
  buildMatrixColumns,
  buildSubtestMatrix,
  filterMatrixRows,
  sortMatrixRows,
  type PlatformSubtestResults,
} from '../../../../utils/subtestMatrix';
import { getPlatformIcon } from '../../../Shared/Icons/platformIcons';
import NoResultsFound from '../../NoResultsFound';
import TableHeader from '../../TableHeader';

const strings = Strings.components.crossPlatformSubtests;

type MatrixTableProps = {
  platformResults: PlatformSubtestResults[];
  filteringSearchTerm: string;
  testVersion: TestVersion;
};

// A real component rather than an inline render callback, so the hooks below
// are called unconditionally. (The single-platform table calls hooks inside its
// <Await> child, which happens to work but is fragile.)
function MatrixTableInner({
  platformResults,
  filteringSearchTerm,
  testVersion,
}: MatrixTableProps) {
  const matrix = useMemo(
    () => buildSubtestMatrix(platformResults, testVersion),
    [platformResults, testVersion],
  );
  const columnsConfiguration = useMemo(
    () => buildMatrixColumns(matrix.columns, tooltipAgreement, getPlatformIcon),
    [matrix.columns],
  );

  // On a fresh (uninitialized) URL, seed filter/sort from cookies into the URL
  // and mark it initialized, so shared links reproduce the same view.
  useInitializeTableStateFromCookies(columnsConfiguration);

  const { tableFilters, onClearFilter, onToggleFilter } =
    useTableFilters(columnsConfiguration);
  const { sortColumn, sortDirection, onToggleSort } =
    useTableSort(columnsConfiguration);

  const rows = useMemo(() => {
    const filtered = filterMatrixRows(
      columnsConfiguration,
      matrix.rows,
      filteringSearchTerm,
      tableFilters,
    );
    return sortMatrixRows(
      columnsConfiguration,
      filtered,
      sortColumn,
      sortDirection,
    );
  }, [
    columnsConfiguration,
    matrix.rows,
    filteringSearchTerm,
    tableFilters,
    sortColumn,
    sortDirection,
  ]);

  const gridTemplateColumns = toGridTemplateColumns(columnsConfiguration);
  const everyPlatformFailed =
    platformResults.length > 0 &&
    platformResults.every((platformResult) => platformResult.error);

  return (
    <Box
      data-testid='subtests-cross-platform-table'
      role='table'
      // Many platforms make a wide table; scrolling beats compressing the
      // columns until the deltas are unreadable.
      sx={{ marginTop: 3, paddingBottom: 3, overflowX: 'auto' }}
    >
      <TableHeader
        columnsConfiguration={columnsConfiguration}
        filters={tableFilters}
        onToggleFilter={onToggleFilter}
        onClearFilter={onClearFilter}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onToggleSort={onToggleSort}
      />
      {everyPlatformFailed ? (
        <Alert severity='error' sx={{ marginTop: 2 }}>
          {strings.allPlatformsFailed}
        </Alert>
      ) : rows.length === 0 ? (
        <NoResultsFound />
      ) : (
        rows.map((row) => (
          <SubtestsCrossPlatformRow
            key={row.test}
            row={row}
            columns={matrix.columns}
            gridTemplateColumns={gridTemplateColumns}
            testVersion={testVersion}
          />
        ))
      )}
    </Box>
  );
}

type SubtestsCrossPlatformTableProps = {
  filteringSearchTerm: string;
  resultsPromise: PlatformSubtestResults[] | Promise<PlatformSubtestResults[]>;
  testVersion: TestVersion;
};

function SubtestsCrossPlatformTable({
  filteringSearchTerm,
  resultsPromise,
  testVersion,
}: SubtestsCrossPlatformTableProps) {
  return (
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
        {(platformResults: PlatformSubtestResults[]) => (
          <MatrixTableInner
            platformResults={platformResults}
            filteringSearchTerm={filteringSearchTerm}
            testVersion={testVersion}
          />
        )}
      </Await>
    </Suspense>
  );
}

export default SubtestsCrossPlatformTable;
