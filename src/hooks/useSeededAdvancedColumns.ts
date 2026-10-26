import { useLayoutEffect, useState } from 'react';

import { useAppDispatch } from './app';
import useAdvancedColumns from './useAdvancedColumns';
import useRawSearchParams from './useRawSearchParams';
import {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
  updateExpandedRow,
} from '../reducers/ColumnPrefsSlice';
import type { AdvancedColumns } from '../types/types';
import { resolveAdvancedOptions } from '../utils/advancedOptionsUrl';

// On mount, seed the Advanced options in Redux from the URL or cookie (see
// resolveAdvancedOptions). A group neither specifies is left as is. Returns the
// columns to build the table from: the resolved ones until Redux is seeded, as
// a long-lived store may be stale and the table's filter/sort state is read
// once at mount. Call once per results view.
function useSeededAdvancedColumns(): AdvancedColumns {
  const [rawSearchParams] = useRawSearchParams();
  const dispatch = useAppDispatch();
  const [resolved] = useState(() => resolveAdvancedOptions(rawSearchParams));
  const [seeded, setSeeded] = useState(false);
  const advancedColumns = useAdvancedColumns();

  // Layout effect so rows reading Redux are corrected before paint.
  useLayoutEffect(() => {
    const { columns, expandedRow } = resolved;
    if (columns) {
      dispatch(updateShowCliffsDelta(columns.cliffsDelta));
      dispatch(updateShowCles(columns.cles));
      dispatch(updateShowSignificance(columns.significance));
    }
    if (expandedRow) {
      dispatch(updateExpandedRow(expandedRow));
    }
    setSeeded(true);
  }, []);

  return seeded ? advancedColumns : (resolved.columns ?? advancedColumns);
}

export default useSeededAdvancedColumns;
