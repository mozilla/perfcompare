import { useAppSelector } from './app';
import type { ExpandedRowOptions } from '../types/types';

// Visibility of the (power-user) components in the Mann-Whitney-U expanded row
// (effect size, mode analysis, statistics table, warnings) from the columnPrefs
// slice. The slice stores them as one object, so the reference is stable
// between updates and callers can use it directly in `useMemo` deps.
function useExpandedRowOptions(): ExpandedRowOptions {
  return useAppSelector((state) => state.columnPrefs.expandedRow);
}

export default useExpandedRowOptions;
