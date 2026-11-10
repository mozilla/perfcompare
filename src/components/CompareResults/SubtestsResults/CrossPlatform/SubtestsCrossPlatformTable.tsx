import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type WheelEvent,
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
// And the platform cells, so that they're bigger with fewer platforms.
const platformCellContainer = {
  containerType: 'inline-size',
  containerName: 'platform-cell',
} as NestedCSSProperties;

// With too many platforms, only the table scrolls horizontally (see
// useSyncedHorizontalScroll). This box has no overflow itself, so that the
// header can stick to the top of the window.
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
    // A name that wraps would fill the fixed height of the button, touching
    // its edges: smaller and with tighter lines, its 2 lines keep some room.
    // Set by useFlagWrappedPlatformNames.
    '& .table-header [class*="platform-"] button[data-wrapped]': {
      fontSize: '12px',
      lineHeight: 1.05,
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
    '& .table-header .agreement-header::before, & .matrix-row .agreement::before, & .variant-header .agreement-spacer::before':
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
      ...platformCellContainer,
    },
    // Sized for wide columns (up to about 7 platforms), then stepping down
    // with the column's width like the platform headers, one size below them.
    '.status-hint': {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      width: '100%',
      maxWidth: PLATFORM_CONTENT_MAX_WIDTH,
      borderRadius: '4px',
      padding: '5px 8px',
      fontSize: '15px',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '.status-hint .MuiSvgIcon-root': {
      height: '16px',
      width: '16px',
    },
    '@container platform-cell (max-width: 139.99px)': {
      $nest: {
        '& .status-hint': { fontSize: '14px' },
        '& .status-hint .MuiSvgIcon-root': { height: '15px', width: '15px' },
      },
    },
    '@container platform-cell (max-width: 103.99px)': {
      $nest: {
        '& .status-hint': { fontSize: '13px', padding: '4px 6px' },
        '& .status-hint .MuiSvgIcon-root': { height: '14px', width: '14px' },
      },
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

const PLATFORM_HEADER_BUTTONS = '.table-header [class*="platform-"] button';

// Flags the platform headers whose name wraps (see their data-wrapped style),
// whenever the header is laid out again. Each name is measured at its normal
// size first, so that the result doesn't depend on the previous one.
function useFlagWrappedPlatformNames(dependency: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () => {
      for (const button of header.querySelectorAll<HTMLElement>(
        PLATFORM_HEADER_BUTTONS,
      )) {
        delete button.dataset.wrapped;
        const name = [...button.childNodes].find(
          (node) => node.nodeType === Node.TEXT_NODE,
        );
        if (!name) continue;
        const range = document.createRange();
        range.selectNodeContents(name);
        // Not available in jsdom.
        if (!('getClientRects' in range)) continue;
        const lineTops = new Set(
          [...range.getClientRects()].map(({ top }) => Math.round(top)),
        );
        if (lineTops.size > 1) button.dataset.wrapped = '';
      }
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [dependency]);
  return ref;
}

// The rows scroll horizontally in their own box. The header, which has to stay
// out of it to stick to the top of the window, and a scrollbar stuck to the
// bottom of the window (the rows' own one would be at the end of the table)
// follow along.
function useSyncedHorizontalScroll(layoutDependency: unknown) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  // Whether there are more columns out of view, on each side.
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const updateOverflow = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const maxScrollLeft = body.scrollWidth - body.clientWidth;
    // 1px of slack for fractional widths.
    const left = body.scrollLeft > 1;
    const right = body.scrollLeft < maxScrollLeft - 1;
    setOverflow((previous) =>
      previous.left === left && previous.right === right
        ? previous
        : { left, right },
    );
  }, []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    updateOverflow();
    // Not available in jsdom.
    if (!body || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(body);
    return () => observer.disconnect();
  }, [updateOverflow, layoutDependency]);

  const scrollAllTo = (left: number) => {
    for (const element of [
      bodyRef.current,
      headerRef.current,
      scrollbarRef.current,
    ]) {
      if (element && element.scrollLeft !== left) element.scrollLeft = left;
    }
    updateOverflow();
  };
  return {
    bodyRef,
    headerRef,
    scrollbarRef,
    overflow,
    onBodyScroll: () => scrollAllTo(bodyRef.current?.scrollLeft ?? 0),
    onScrollbarScroll: () => scrollAllTo(scrollbarRef.current?.scrollLeft ?? 0),
    // The header can't scroll by itself: pass on horizontal trackpad and
    // shift + wheel scrolling.
    onHeaderWheel: (event: WheelEvent<HTMLDivElement>) => {
      const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (bodyRef.current && deltaX) bodyRef.current.scrollLeft += deltaX;
    },
  };
}

const EDGE_FADE_WIDTH = 32;

// Hints that there are more columns, by fading the edges they're hidden
// behind: the right edge, and on the left the edge of the pinned subtest and
// agreement columns, which stay opaque.
function edgeFadeMask(
  overflow: { left: boolean; right: boolean },
  pinnedWidth: number,
) {
  if (!overflow.left && !overflow.right) return {};
  const stops = ['black 0'];
  if (overflow.left) {
    stops.push(
      `black ${pinnedWidth}px`,
      `transparent ${pinnedWidth}px`,
      `black ${pinnedWidth + EDGE_FADE_WIDTH}px`,
    );
  }
  if (overflow.right) {
    stops.push(`black calc(100% - ${EDGE_FADE_WIDTH}px)`, 'transparent 100%');
  } else {
    stops.push('black 100%');
  }
  const mask = `linear-gradient(to right, ${stops.join(', ')})`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

// No visible scrollbar on the rows: the one stuck to the bottom of the window
// replaces it.
const hiddenScrollbar = {
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
} as const;

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
  const headerRef = useFlagWrappedPlatformNames(columnsConfiguration);
  const horizontalScroll = useSyncedHorizontalScroll(columnsConfiguration);
  const platformCount = matrix.columns.length;
  const minWidth = `max(${RESULTS_TABLE_MIN_WIDTH}, ${matrixMinWidth(
    platformCount,
    agreementColumnWidth(platformCount),
  )}px)`;
  // The right edge of the pinned columns, in the scrolling boxes.
  const pinnedWidth =
    SUBTESTS_COLUMN_WIDTH + Spacing.Small + agreementColumnWidth(platformCount);
  const fadeMask = edgeFadeMask(horizontalScroll.overflow, pinnedWidth);
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
        {/* Stays at the top of the window, below the controls, while
          scrolling the rows, like the results table's header. */}
        <Box
          ref={headerRef}
          data-testid='subtests-cross-platform-header'
          sx={{
            position: 'sticky',
            top: `var(${CONTROLS_HEIGHT_VARIABLE}, 0px)`,
            zIndex: 100,
            bgcolor: 'background.default',
          }}
        >
          <Box
            ref={horizontalScroll.headerRef}
            onWheel={horizontalScroll.onHeaderWheel}
            sx={{ overflowX: 'hidden', ...fadeMask }}
          >
            <Box sx={{ minWidth, '& .table-header': { minWidth } }}>
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
          </Box>
        </Box>
        <Box
          ref={horizontalScroll.bodyRef}
          onScroll={horizontalScroll.onBodyScroll}
          data-testid='subtests-cross-platform-body'
          sx={{ overflowX: 'auto', ...hiddenScrollbar, ...fadeMask }}
        >
          <Box sx={{ minWidth }}>{content}</Box>
        </Box>
        <Box
          ref={horizontalScroll.scrollbarRef}
          onScroll={horizontalScroll.onScrollbarScroll}
          // A duplicate of the rows' scrollbar: they stay reachable from the
          // keyboard through their links.
          aria-hidden
          data-testid='subtests-cross-platform-scrollbar'
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 100,
            overflowX: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ minWidth, height: '1px' }} />
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
