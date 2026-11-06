import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type { TableConfig } from '../types/types';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import {
  SORT_PARAM,
  SORT_COOKIE,
  isTableStateInitialized,
  currentUrlParams,
} from '../utils/tableStatePersistence';

// This hook handles the state that handles table sorting, and also takes care
// of handling the URL parameters that mirror this state.
//
// In the URL:
// * no column indication means the default (that is there is no sort)
// * otherwise, a single sort parameter contains both the column and the
// direction, separated by a character |.

// persist: false keeps the sort out of the cookie shared with the results
// tables; defaultSort applies when the URL has no sort.
const useTableSort = <TRow>(
  columnsConfiguration: TableConfig<TRow>,
  {
    persist = true,
    defaultSort = '',
  }: { persist?: boolean; defaultSort?: string } = {},
) => {
  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  // Cookies are only consulted for an uninitialized URL; an initialized URL is
  // the single source of truth so a shared link reproduces the same view.
  const readCookies =
    persist && !isTableStateInitialized(window.location.search);
  const sortFromUrl =
    rawSearchParams.get(SORT_PARAM) ??
    (readCookies ? getCookie(SORT_COOKIE) : null) ??
    defaultSort;
  const [columnId, direction] = useMemo(() => {
    const [columnId, direction] = sortFromUrl.split('|');
    if (!columnId) {
      return [null, null];
    }

    const columnConfiguration = columnsConfiguration.find(
      (column) => column.key === columnId,
    );
    if (!columnConfiguration) {
      console.warn(`The column ${columnId} is unknown, reseting the sort.`);
      return [null, null];
    }

    if (direction !== 'asc' && direction !== 'desc') {
      return [columnId, 'desc'];
    }

    return [columnId, direction];
  }, [sortFromUrl, columnsConfiguration]);

  const [sortDirection, setSortDirection] = useState(
    direction as 'asc' | 'desc' | null,
  );
  const [sortColumn, setSortColumn] = useState(columnId);

  const onToggleSort = (
    columnId: string,
    newSortDirection: 'asc' | 'desc' | null,
  ) => {
    const params = currentUrlParams();
    if (newSortDirection === null) {
      setSortColumn(null);
      setSortDirection(null);
      // An empty param keeps a cleared sort from falling back to defaultSort.
      if (defaultSort) params.set(SORT_PARAM, '');
      else params.delete(SORT_PARAM);
      if (persist) deleteCookie(SORT_COOKIE);
    } else {
      setSortColumn(columnId);
      setSortDirection(newSortDirection);
      params.set(SORT_PARAM, columnId + '|' + newSortDirection);
      if (persist) setCookie(SORT_COOKIE, columnId + '|' + newSortDirection);
    }
    updateRawSearchParams(params);
  };

  return { sortDirection, sortColumn, onToggleSort };
};

export default useTableSort;

// This function sorts the results array in accordance to the specified column
// and direction. If no column is specified, the first column (the subtests)
// is used.
export function sortResults<TRow>(
  columnsConfiguration: TableConfig<TRow>,
  results: TRow[],
  columnId: string | null,
  direction: 'asc' | 'desc' | null,
  defaultSortFunction: (resultA: TRow, resultB: TRow) => number,
) {
  let sortFunction = defaultSortFunction;

  let columnConfiguration: TableConfig<TRow>[number] | undefined;
  if (columnId && direction) {
    columnConfiguration = columnsConfiguration.find(
      (column) => column.key === columnId,
    );
  }

  if (columnConfiguration) {
    if (!('sortFunction' in columnConfiguration)) {
      console.warn(
        `No sortFunction information for the columnConfiguration ${String(
          columnConfiguration.name ?? columnId,
        )}`,
      );
      return results;
    }

    sortFunction = columnConfiguration.sortFunction;
  }

  const directionedSortFunction =
    direction === 'desc'
      ? (itemA: TRow, itemB: TRow) => sortFunction(itemB, itemA)
      : sortFunction;

  return results.toSorted(directionedSortFunction);
}
