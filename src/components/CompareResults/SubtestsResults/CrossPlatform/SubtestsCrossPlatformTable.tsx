import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Await, useLoaderData } from 'react-router';
import { Virtuoso } from 'react-virtuoso';
import { style } from 'typestyle';
import type { NestedCSSProperties } from 'typestyle/lib/types';

import SubtestsCrossPlatformRow from './SubtestsCrossPlatformRow';
import { RESULTS_TABLE_MIN_WIDTH } from '../../../../common/constants';
import { useAppSelector } from '../../../../hooks/app';
import useExpandedRowOptions from '../../../../hooks/useExpandedRowOptions';
import useSeededAdvancedColumns from '../../../../hooks/useSeededAdvancedColumns';
import useTableFilters, {
  filterResults,
  getFilterHiddenSummary,
} from '../../../../hooks/useTableFilters';
import useTableSort, { sortResults } from '../../../../hooks/useTableSort';
import { Strings } from '../../../../resources/Strings';
import { Colors, Spacing } from '../../../../styles';
import { toGridTemplateColumns } from '../../../../utils/gridTemplateColumns';
import {
  agreementColumnWidth,
  matrixMinWidth,
  DEFAULT_MATRIX_SORT,
  SUBTESTS_COLUMN_WIDTH,
  buildMatrixColumns,
  buildSubtestMatrix,
  PLATFORM_CONTENT_MAX_WIDTH,
  compareSubtestNames,
  matrixRowMatchesSearchTerm,
  type PlatformColumnInfo,
  type PlatformSubtestResults,
  type PlatformVariant,
} from '../../../../utils/subtestMatrix';
import { buildSubtestsCompareWithBaseLink } from '../../../../utils/subtestsLinks';
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

// The platform headers' font size steps down with the column's own width,
// which depends on the number of platforms, not on the screen's. Typestyle's
// types predate container queries, hence the cast.
const platformHeaderContainer = {
  containerType: 'inline-size',
  containerName: 'platform-header',
} as NestedCSSProperties;
// Same for the agreement header, which drops its filter count when narrow.
const agreementHeaderContainer = {
  containerType: 'inline-size',
  containerName: 'agreement-header',
} as NestedCSSProperties;

// No overflow here: like the results table, the page itself scrolls
// horizontally when there are too many platforms, so that the header can
// stick to the top of the window (an overflowing box would become the
// header's scroll container instead).
const matrixStyles = style({
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
    // Same inline padding as the platform cells, so labels keep clear of the
    // header edges. The tag sits below the button, so it doesn't widen the
    // column.
    '.table-header [class*="platform-"]': {
      paddingInline: `${Spacing.xSmall}px`,
      flexDirection: 'column',
      gap: Spacing.xSmall,
      ...platformHeaderContainer,
    },
    // Every platform button fills its (equal-width) column, up to
    // PLATFORM_CONTENT_MAX_WIDTH, centered, so that they all have the same
    // width.
    '.table-header [class*="platform-"] > span:not(.platform-tag)': {
      display: 'flex',
      alignSelf: 'stretch',
      justifyContent: 'center',
      minWidth: 0,
    },
    // Names wrap inside the button rather than spilling out of it: the icon
    // stays on the left, the name wraps between words, and the column's
    // minimum width fits the longest word.
    '.table-header [class*="platform-"] button': {
      flexWrap: 'nowrap',
      width: '100%',
      maxWidth: PLATFORM_CONTENT_MAX_WIDTH,
      minWidth: 0,
      padding: `${Spacing.xSmall}px ${Spacing.Small - 2}px`,
      textAlign: 'center',
      overflowWrap: 'break-word',
    },
    // So that names like "Windows 11" keep fitting on one line, next to the
    // sort icon, as columns narrow.
    '@container platform-header (max-width: 139.99px)': {
      $nest: {
        '& .table-header [class*="platform-"] button': { fontSize: '14px' },
      },
    },
    '@container platform-header (max-width: 103.99px)': {
      $nest: {
        '& .table-header [class*="platform-"] button': { fontSize: '13px' },
      },
    },
    // The variant row and the table header read as one two-row header.
    '.variant-header': {
      display: 'grid',
      // Keep this gap in sync with the header grid in TableHeader.
      columnGap: `${Spacing.Small}px`,
      marginTop: Spacing.Medium,
      paddingTop: Spacing.Medium,
      borderRadius: '4px 4px 0 0',
      fontWeight: 700,
    },
    '.variant-header + .table-header': {
      marginTop: 0,
      paddingTop: Spacing.Small,
      borderRadius: '0 0 4px 4px',
    },
    '.variant-cell': {
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: Spacing.xSmall,
      borderBottom: '2px solid',
      borderColor: 'inherit',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    },
    '& .variant-header .subtests-spacer': stickyCell(0),
    '& .variant-header .agreement-spacer': stickyCell(agreementLeft),
    '.platform-tag': {
      borderRadius: '4px',
      padding: '1px 6px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
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
    '& .table-header .agreement-header': agreementHeaderContainer,
    // With many platforms, the column narrows (see agreementColumnWidth). So
    // that its header still fits on one line, it drops its "(6)" (the filter
    // menu still shows the selected values) and steps down like the platform
    // headers.
    '@container agreement-header (max-width: 159.99px)': {
      $nest: {
        '& .table-header .agreement-header .filter-count': {
          display: 'none',
        },
        // The filter button, after the sort one.
        '& .table-header .agreement-header button + button': {
          fontSize: '14px',
          paddingInline: `${Spacing.Small}px`,
        },
      },
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
    // Compact cells: the tint and the icon carry the status, so a column
    // only needs to fit the delta.
    '.matrix-row .platform-cell': {
      padding: `${Spacing.xSmall}px`,
    },
    '.status-hint': {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      width: '100%',
      maxWidth: PLATFORM_CONTENT_MAX_WIDTH,
      borderRadius: '4px',
      padding: '4px 6px',
      fontSize: '0.8125rem',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '.status-hint .MuiSvgIcon-root': {
      height: '14px',
      width: '14px',
    },
    '.status-hint-regression .MuiSvgIcon-root': {
      // Moves the icon a bit lower so that it _looks_ centered.
      marginTop: '2px',
    },
  },
});

// The theme colors of the test option chips, one per distinct tag so that a
// tag has the same color in every column.
const TAG_BACKGROUNDS = [
  'tagOptions.backgroundColorOption1',
  'tagOptions.backgroundColorOption2',
  'tagOptions.backgroundColorOption3',
];

function renderPlatformTag(column: PlatformColumnInfo, tagIndex: number) {
  return (
    <Box
      component='span'
      className='platform-tag'
      sx={{
        color: 'tagOptions.text',
        bgcolor: TAG_BACKGROUNDS[tagIndex % TAG_BACKGROUNDS.length],
      }}
    >
      {column.tag}
    </Box>
  );
}

type VariantHeaderProps = {
  variants: PlatformVariant[];
  gridTemplateColumns: string;
  minWidth: string;
};

// Spans each variant's label over its columns, above the platform names.
function VariantHeader({
  variants,
  gridTemplateColumns,
  minWidth,
}: VariantHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const background =
    themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark;
  return (
    <div
      className='variant-header'
      data-testid='variant-header'
      role='row'
      style={{ gridTemplateColumns, minWidth, background }}
    >
      <div className='subtests-spacer' aria-hidden='true' />
      <div className='agreement-spacer' aria-hidden='true' />
      {variants.map((variant) => (
        <Box
          key={variant.key}
          className='variant-cell'
          role='columnheader'
          aria-colspan={variant.columnCount}
          sx={{
            gridColumn: `span ${variant.columnCount}`,
            borderColor: 'divider',
          }}
        >
          {variant.label}
        </Box>
      ))}
    </div>
  );
}

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
  const columnsConfiguration = useMemo(() => {
    const tags = [
      ...new Set(matrix.columns.flatMap(({ tag }) => (tag ? [tag] : []))),
    ];
    return buildMatrixColumns(matrix.columns, (column) =>
      renderPlatformTag(column, tags.indexOf(column.tag ?? '')),
    );
  }, [matrix.columns]);

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
  const minWidth = `max(${RESULTS_TABLE_MIN_WIDTH}, ${matrixMinWidth(
    platformCount,
    agreementColumnWidth(platformCount),
  )}px)`;
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
      {matrix.hiddenPlatforms.length > 0 && (
        <Alert
          severity='info'
          data-testid='hidden-platforms-notice'
          sx={{ marginTop: 2 }}
        >
          {strings.hiddenPlatforms(matrix.hiddenPlatforms)}
        </Alert>
      )}
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
          {/* Stays at the top of the window, below the controls, while
            scrolling the rows, like the results table's header. */}
          <Box
            data-testid='subtests-cross-platform-header'
            sx={{
              position: 'sticky',
              top: `var(${CONTROLS_HEIGHT_VARIABLE}, 0px)`,
              zIndex: 100,
              bgcolor: 'background.default',
            }}
          >
            {matrix.variants.length > 1 && (
              <VariantHeader
                variants={matrix.variants}
                gridTemplateColumns={gridTemplateColumns}
                minWidth={minWidth}
              />
            )}
            <TableHeader
              columnsConfiguration={columnsConfiguration}
              filters={tableFilters}
              onToggleFilter={onToggleFilter}
              onClearFilter={onClearFilter}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onToggleSort={onToggleSort}
            />
          </Box>
          {content}
        </Box>
      </div>
    </>
  );
}

const CONTROLS_HEIGHT_VARIABLE = '--cross-platform-controls-height';

// The height of an element, kept up to date as it wraps.
function useElementHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setHeight(element.offsetHeight);
    update();
    // Not available in jsdom.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, height };
}

type SubtestsCrossPlatformTableProps = {
  filteringSearchTerm: string;
  resultsPromise: Promise<PlatformSubtestResults[]>;
  // The search and download row, stuck to the top of the window above the
  // table header, like the results table's controls.
  controls: ReactNode;
};

function SubtestsCrossPlatformTable({
  filteringSearchTerm,
  resultsPromise,
  controls,
}: SubtestsCrossPlatformTableProps) {
  // The controls are outside of Suspense, so that they're usable while the
  // results load and aren't remounted when they arrive. The table header then
  // sticks below them, at their height.
  const { ref: controlsRef, height: controlsHeight } = useElementHeight();
  return (
    <div
      style={
        { [CONTROLS_HEIGHT_VARIABLE]: `${controlsHeight}px` } as CSSProperties
      }
    >
      <Box
        ref={controlsRef}
        data-testid='subtests-cross-platform-controls'
        sx={{
          position: 'sticky',
          top: 0,
          // Above the table header.
          zIndex: 101,
          bgcolor: 'background.default',
          paddingBlock: 1,
        }}
      >
        {controls}
      </Box>
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
    </div>
  );
}

export default SubtestsCrossPlatformTable;
