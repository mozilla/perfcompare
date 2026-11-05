import { Suspense, useCallback, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await, useLoaderData } from 'react-router';
import { Virtuoso } from 'react-virtuoso';
import { style } from 'typestyle';

import SubtestsCrossPlatformRow from './SubtestsCrossPlatformRow';
import { RESULTS_TABLE_MIN_WIDTH } from '../../../../common/constants';
import useExpandedRowOptions from '../../../../hooks/useExpandedRowOptions';
import useSeededAdvancedColumns from '../../../../hooks/useSeededAdvancedColumns';
import useTableFilters, {
  filterResults,
  getFilterHiddenSummary,
} from '../../../../hooks/useTableFilters';
import useTableSort, { sortResults } from '../../../../hooks/useTableSort';
import { Strings } from '../../../../resources/Strings';
import { Spacing } from '../../../../styles';
import { toGridTemplateColumns } from '../../../../utils/gridTemplateColumns';
import {
  AGREEMENT_COLUMN_WIDTH,
  DEFAULT_MATRIX_SORT,
  PLATFORM_COLUMN_MIN_WIDTH,
  SUBTESTS_COLUMN_WIDTH,
  buildMatrixColumns,
  buildSubtestMatrix,
  compareSubtestNames,
  matrixRowMatchesSearchTerm,
  type PlatformColumnInfo,
  type PlatformSubtestResults,
} from '../../../../utils/subtestMatrix';
import { buildSubtestsCompareWithBaseLink } from '../../../../utils/subtestsLinks';
import { getPlatformIcon } from '../../../Shared/Icons/platformIcons';
import FilteredRowsNotice from '../../FilteredRowsNotice';
import NoResultsFound from '../../NoResultsFound';
import type { LoaderReturnValue } from '../../subtestsCrossPlatformLoader';
import TableHeader from '../../TableHeader';

const strings = Strings.components.crossPlatformSubtests;
const TABLE_STATE_OPTIONS = { persist: false };
const SORT_OPTIONS = { persist: false, defaultSort: DEFAULT_MATRIX_SORT };

// The subtest and agreement columns stay visible while the platform columns
// scroll horizontally.
const stickyCell = (left: number) => ({
  position: 'sticky' as const,
  left,
  zIndex: 1,
  background: 'inherit',
});
const agreementLeft = SUBTESTS_COLUMN_WIDTH + Spacing.Small;

const matrixStyles = style({
  overflowX: 'auto',
  marginTop: Spacing.Large,
  paddingBottom: Spacing.Large,
  $nest: {
    '.matrix-row': {
      display: 'grid',
      // Keep this gap in sync with the header grid in TableHeader.
      columnGap: `${Spacing.Small}px`,
      alignItems: 'stretch',
      borderRadius: '4px',
    },
    '.matrix-row .cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
      wordBreak: 'break-word',
    },
    // Long platform labels wrap inside their sort button.
    '.table-header .cell button': {
      height: 'auto',
      minHeight: '32px',
    },
    // After .cell so that these win. Each selector needs its "&", as
    // typestyle only scopes the first one of a list.
    '& .table-header .subtests-header, & .matrix-row .subtests': {
      ...stickyCell(0),
      justifySelf: 'stretch',
      justifyContent: 'flex-start',
      paddingInlineStart: Spacing.Medium,
    },
    '& .table-header .agreement-header, & .matrix-row .agreement': {
      ...stickyCell(agreementLeft),
      boxShadow: '4px 0 4px -4px rgba(0, 0, 0, 0.3)',
    },
    // Covers the grid gap, which would otherwise show scrolled cells.
    '& .table-header .agreement-header::before, & .matrix-row .agreement::before':
      {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -Spacing.Small,
        width: Spacing.Small,
        background: 'inherit',
      },
    '.status-hint': {
      display: 'inline-flex',
      gap: '6px',
      borderRadius: '4px',
      padding: '4px 10px',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    },
    '.status-hint .MuiSvgIcon-root': {
      height: '16px',
    },
    '.status-hint-regression .MuiSvgIcon-root': {
      // Moves the icon a bit lower so that it _looks_ centered.
      marginTop: '2px',
    },
    '.noise-label': {
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: 1.2,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    },
  },
});

type MatrixTableProps = {
  platformResults: PlatformSubtestResults[];
  filteringSearchTerm: string;
};

function MatrixTable({
  platformResults,
  filteringSearchTerm,
}: MatrixTableProps) {
  const { baseRev, baseRepo, newRev, newRepo, frameworkId, testVersion } =
    useLoaderData<LoaderReturnValue>();
  const advancedColumns = useSeededAdvancedColumns();
  const expandedRow = useExpandedRowOptions();

  const matrix = useMemo(
    () => buildSubtestMatrix(platformResults, testVersion),
    [platformResults, testVersion],
  );
  const columnsConfiguration = useMemo(
    () => buildMatrixColumns(matrix.columns, getPlatformIcon),
    [matrix.columns],
  );

  const { tableFilters, onClearFilter, onToggleFilter } = useTableFilters(
    columnsConfiguration,
    TABLE_STATE_OPTIONS,
  );
  const { sortColumn, sortDirection, onToggleSort } = useTableSort(
    columnsConfiguration,
    SORT_OPTIONS,
  );

  const filteredRows = useMemo(
    () =>
      filterResults(
        columnsConfiguration,
        matrix.rows,
        filteringSearchTerm,
        tableFilters,
        matrixRowMatchesSearchTerm,
      ),
    [columnsConfiguration, matrix.rows, filteringSearchTerm, tableFilters],
  );
  const { activeFilters, hiddenCount } = useMemo(
    () =>
      getFilterHiddenSummary(
        columnsConfiguration,
        matrix.rows,
        filteringSearchTerm,
        tableFilters,
        matrixRowMatchesSearchTerm,
        filteredRows.length,
      ),
    [
      columnsConfiguration,
      matrix.rows,
      filteringSearchTerm,
      tableFilters,
      filteredRows,
    ],
  );
  const rows = useMemo(
    () =>
      sortResults(
        columnsConfiguration,
        filteredRows,
        sortColumn,
        sortDirection,
        compareSubtestNames,
      ),
    [columnsConfiguration, filteredRows, sortColumn, sortDirection],
  );

  const getCellLink = useCallback(
    (column: PlatformColumnInfo, test: string) =>
      buildSubtestsCompareWithBaseLink(
        {
          baseRev,
          baseRepo,
          newRev,
          newRepo,
          framework: frameworkId,
          baseParentSignature: column.baseParentSignature,
          newParentSignature: column.newParentSignature,
          search: test,
        },
        testVersion,
        advancedColumns,
        expandedRow,
      ),
    [
      baseRev,
      baseRepo,
      newRev,
      newRepo,
      frameworkId,
      testVersion,
      advancedColumns,
      expandedRow,
    ],
  );

  const gridTemplateColumns = toGridTemplateColumns(columnsConfiguration);
  const platformCount = matrix.columns.length;
  const minWidth = `max(${RESULTS_TABLE_MIN_WIDTH}, ${
    SUBTESTS_COLUMN_WIDTH +
    AGREEMENT_COLUMN_WIDTH +
    platformCount * PLATFORM_COLUMN_MIN_WIDTH +
    (platformCount + 1) * Spacing.Small
  }px)`;
  const everyPlatformFailed =
    platformResults.length > 0 &&
    platformResults.every((platformResult) => platformResult.error);

  let content;
  if (everyPlatformFailed) {
    content = (
      <Alert severity='error' sx={{ marginTop: 2 }}>
        {strings.allPlatformsFailed}
      </Alert>
    );
  } else if (!rows.length) {
    content = <NoResultsFound />;
  } else {
    content = (
      <Virtuoso
        useWindowScroll
        data={rows}
        computeItemKey={(_, row) => row.test}
        itemContent={(_, row) => (
          // Virtuoso can't measure margins, hence the padding.
          <div style={{ paddingTop: Spacing.Small }}>
            <SubtestsCrossPlatformRow
              row={row}
              columns={matrix.columns}
              gridTemplateColumns={gridTemplateColumns}
              testVersion={testVersion}
              getCellLink={getCellLink}
            />
          </div>
        )}
      />
    );
  }

  return (
    <>
      {hiddenCount > 0 && (
        <FilteredRowsNotice
          hiddenCount={hiddenCount}
          activeFilters={activeFilters}
        />
      )}
      <div
        className={matrixStyles}
        data-testid='subtests-cross-platform-table'
        role='table'
      >
        <Box sx={{ minWidth, '& .table-header': { minWidth } }}>
          <TableHeader
            columnsConfiguration={columnsConfiguration}
            filters={tableFilters}
            onToggleFilter={onToggleFilter}
            onClearFilter={onClearFilter}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onToggleSort={onToggleSort}
          />
          {content}
        </Box>
      </div>
    </>
  );
}

type SubtestsCrossPlatformTableProps = {
  filteringSearchTerm: string;
  resultsPromise: Promise<PlatformSubtestResults[]>;
};

function SubtestsCrossPlatformTable({
  filteringSearchTerm,
  resultsPromise,
}: SubtestsCrossPlatformTableProps) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
          <CircularProgress />
        </Box>
      }
    >
      <Await resolve={resultsPromise}>
        {(platformResults: PlatformSubtestResults[]) => (
          <MatrixTable
            platformResults={platformResults}
            filteringSearchTerm={filteringSearchTerm}
          />
        )}
      </Await>
    </Suspense>
  );
}

export default SubtestsCrossPlatformTable;
