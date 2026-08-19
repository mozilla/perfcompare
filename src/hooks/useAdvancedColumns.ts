import { useMemo } from 'react';

import { useAppSelector } from './app';
import type { AdvancedColumns } from '../types/types';

// Visibility of the advanced (power-user) statistics columns (Cliff's Delta,
// CLES) from the columnPrefs slice. Returns a stable object memoized on the
// two flags, so callers can use it directly in `useMemo` deps and pass it to
// the strategy renderers without re-rendering on unrelated state changes.
function useAdvancedColumns(): AdvancedColumns {
  const cliffsDelta = useAppSelector(
    (state) => state.columnPrefs.showCliffsDelta,
  );
  const cles = useAppSelector((state) => state.columnPrefs.showCles);
  const significance = useAppSelector(
    (state) => state.columnPrefs.showSignificance,
  );
  return useMemo(
    () => ({ cliffsDelta, cles, significance }),
    [cliffsDelta, cles, significance],
  );
}

export default useAdvancedColumns;
