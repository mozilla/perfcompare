// Central definitions for how the results table's filter/sort state is
// persisted, so the query-param and cookie keys live in exactly one place.
//
// The state lives in two layers:
// * the URL (`filter_<col>`, `sort`) — the shareable source of truth;
// * cookies (`perfcompare_filter_<col>`, `perfcompare_sort`) — a per-browser
//   memory of the last-used values.
//
// A URL is considered "initialized" once the app has materialised the table
// state into it (marker below). Cookies are only ever *read* for an
// *uninitialized* URL; an initialized URL is the single source of truth, so a
// shared link reproduces the same view for everyone regardless of their
// cookies. Cookies are still *written* on every change, so the memory survives
// for the next fresh visit.

// Marker that flags a URL as "initialized" (see above).
export const INITIALIZED_PARAM = 'initialized';

// URL query-parameter keys.
export const SORT_PARAM = 'sort';
export const filterParam = (columnKey: string) => `filter_${columnKey}`;

// Cookie keys.
export const SORT_COOKIE = 'perfcompare_sort';
export const filterCookie = (columnKey: string) =>
  `perfcompare_filter_${columnKey}`;

// Whether the URL already carries the initialized marker.
export function isTableStateInitialized(search: string): boolean {
  return new URLSearchParams(search).has(INITIALIZED_PARAM);
}

// Read the *live* URL params. Writes must start from this rather than a
// memoized snapshot, otherwise params added out-of-band (e.g. the initialized
// marker, seeded once on mount) would be clobbered by a later filter/sort
// change.
export function currentUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
