import { useEffect } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type {
  CompareResultsTableConfig,
  CompareMannWhitneyResultsTableConfig,
} from '../types/types';
import { getCookie } from '../utils/cookies';
import {
  INITIALIZED_PARAM,
  SORT_PARAM,
  SORT_COOKIE,
  filterParam,
  filterCookie,
  isTableStateInitialized,
  currentUrlParams,
} from '../utils/tableStatePersistence';

// On the first load of an *uninitialized* results URL (e.g. arriving from the
// search form), copy the remembered filter/sort cookies into the URL and stamp
// it as initialized. From then on the URL fully describes the view, so sharing
// it reproduces the same result for everyone — the recipient's cookies are
// ignored because the URL is initialized (see useTableFilters/useTableSort).
//
// This runs exactly once and only mutates the URL via history.replaceState
// (through useRawSearchParams), so it never triggers a re-render or a loader
// refetch. It intentionally has no effect on an already-initialized URL.
const useInitializeTableStateFromCookies = (
  columnsConfiguration:
    | CompareResultsTableConfig
    | CompareMannWhitneyResultsTableConfig,
) => {
  const [, updateRawSearchParams] = useRawSearchParams();

  useEffect(() => {
    if (isTableStateInitialized(window.location.search)) {
      return;
    }

    const params = currentUrlParams();

    // Only seed a value from a cookie when the URL doesn't already specify it,
    // so an explicit URL param always wins over the cookie.
    for (const column of columnsConfiguration) {
      if (!('filter' in column)) {
        continue;
      }
      const param = filterParam(column.key);
      if (!params.has(param)) {
        const cookieValue = getCookie(filterCookie(column.key));
        if (cookieValue) {
          params.set(param, cookieValue);
        }
      }
    }

    if (!params.has(SORT_PARAM)) {
      const sortCookie = getCookie(SORT_COOKIE);
      if (sortCookie) {
        params.set(SORT_PARAM, sortCookie);
      }
    }

    // Stamp the marker even when there were no cookies, so a filter-free view
    // is still "initialized" and can't pick up cookies on this or another
    // browser later.
    params.set(INITIALIZED_PARAM, '1');
    updateRawSearchParams(params);
    // Mount-only: the URL is materialised once and the data hooks have already
    // seeded their state from the same cookies during the first render.
  }, []);
};

export default useInitializeTableStateFromCookies;
