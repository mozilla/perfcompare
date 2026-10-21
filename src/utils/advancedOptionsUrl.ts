import {
  ADVANCED_COLUMNS_PARAM,
  parseAdvancedColumns,
  serializeAdvancedColumns,
} from './advancedColumnsUrl';
import { getCookie, setCookie, deleteCookie } from './cookies';
import {
  EXPANDED_ROW_PARAM,
  parseExpandedRow,
  serializeExpandedRow,
} from './expandedRowUrl';
import { isTableStateInitialized } from './tableStatePersistence';
import type { AdvancedColumns, ExpandedRowOptions } from '../types/types';

// The "Advanced options" selection (columns + expanded row) is persisted in the
// URL and cookies with the same precedence as the table's filter/sort state
// (see tableStatePersistence).
export const ADVANCED_COLUMNS_COOKIE = 'perfcompare_advanced_columns';
export const EXPANDED_ROW_COOKIE = 'perfcompare_advanced_expanded';

// Write the selection onto `params`, deleting a group's param when it's empty.
// Pass `explicit` for links to another page: their URL isn't initialized, so
// an absent param would let the viewer's cookie win; an empty value pins
// "none" instead.
export function setAdvancedOptionsParams(
  params: URLSearchParams,
  columns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
  { explicit = false }: { explicit?: boolean } = {},
): URLSearchParams {
  const write = (param: string, value: string | null) => {
    if (value || explicit) {
      params.set(param, value ?? '');
    } else {
      params.delete(param);
    }
  };
  write(ADVANCED_COLUMNS_PARAM, serializeAdvancedColumns(columns));
  write(EXPANDED_ROW_PARAM, serializeExpandedRow(expandedRow));
  return params;
}

export function setAdvancedOptionsCookies(
  columns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
): void {
  const write = (cookie: string, value: string | null) =>
    value ? setCookie(cookie, value) : deleteCookie(cookie);
  write(ADVANCED_COLUMNS_COOKIE, serializeAdvancedColumns(columns));
  write(EXPANDED_ROW_COOKIE, serializeExpandedRow(expandedRow));
}

// A present param wins, even when empty; the cookie only applies to an
// uninitialized URL.
function resolveRawValue(
  params: URLSearchParams,
  param: string,
  cookie: string,
): string | null {
  const value = params.get(param);
  if (value !== null) {
    return value;
  }
  return isTableStateInitialized(params.toString()) ? null : getCookie(cookie);
}

// The selection a page should start with; null for a group neither the URL
// nor a cookie specifies.
export function resolveAdvancedOptions(search: string | URLSearchParams): {
  columns: AdvancedColumns | null;
  expandedRow: ExpandedRowOptions | null;
} {
  const params = new URLSearchParams(search);
  const columns = resolveRawValue(
    params,
    ADVANCED_COLUMNS_PARAM,
    ADVANCED_COLUMNS_COOKIE,
  );
  const expandedRow = resolveRawValue(
    params,
    EXPANDED_ROW_PARAM,
    EXPANDED_ROW_COOKIE,
  );
  return {
    columns:
      columns === null
        ? null
        : parseAdvancedColumns(
            new URLSearchParams({ [ADVANCED_COLUMNS_PARAM]: columns }),
          ),
    expandedRow:
      expandedRow === null
        ? null
        : parseExpandedRow(
            new URLSearchParams({ [EXPANDED_ROW_PARAM]: expandedRow }),
          ),
  };
}

// Copy cookies into an uninitialized URL for groups it doesn't specify.
export function seedAdvancedOptionsParamsFromCookies(
  params: URLSearchParams,
): void {
  for (const [param, cookie] of [
    [ADVANCED_COLUMNS_PARAM, ADVANCED_COLUMNS_COOKIE],
    [EXPANDED_ROW_PARAM, EXPANDED_ROW_COOKIE],
  ]) {
    if (!params.has(param)) {
      const cookieValue = getCookie(cookie);
      if (cookieValue) {
        params.set(param, cookieValue);
      }
    }
  }
}
