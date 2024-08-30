import { useMemo } from 'react';

type UpdateRawSearchParamsOptions = {
  method?: 'replace' | 'push';
};

type UpdateRawSearchParams = (
  newSearchParams: URLSearchParams,
  options?: UpdateRawSearchParamsOptions,
) => void;

type RawSearchParams = [URLSearchParams, UpdateRawSearchParams];

/**
 * This hook provides an `updateSearchParams` function that can update the
 * search parameters _without_ creating a re-render on the router level.
 */
const useRawSearchParams = (): RawSearchParams => {
  // Memoize the current search parameters to avoid unnecessary recalculations
  const searchParams = useMemo(() => {
    return new URLSearchParams(window.location.search);
  }, [window.location.search]);

  // This function updates the search params without causing a re-render
  // and provides flexibility to use either pushState or replaceState.
  const updateSearchParams: UpdateRawSearchParams = (
    newSearchParams,
    options = { method: 'replace' },
  ) => {
    const newUrl = `?${newSearchParams.toString()}`;

    // Depending on the method, use either pushState or replaceState
    // to update the URL without causing a component re-render.
    if (options.method === 'push') {
      window.history.pushState(null, '', newUrl);
    } else {
      window.history.replaceState(null, '', newUrl);
    }
  };

  return [searchParams, updateSearchParams];
};

export default useRawSearchParams;
