import { useEffect } from 'react';

import { useAppDispatch } from './app';
import useRawSearchParams from './useRawSearchParams';
import {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
  updateExpandedRow,
} from '../reducers/ColumnPrefsSlice';
import {
  ADVANCED_COLUMNS_PARAM,
  parseAdvancedColumns,
} from '../utils/advancedColumnsUrl';
import { EXPANDED_ROW_PARAM, parseExpandedRow } from '../utils/expandedRowUrl';

// On mount, seed the advanced-options visibility (columns + expanded row) from
// the URL so a shared link reproduces the selection. Toggling updates both the
// URL (for sharing) and Redux (for reactive rendering); this only handles the
// initial URL → Redux direction. Call once per results view.
function useSeedAdvancedOptionsFromUrl() {
  const [rawSearchParams] = useRawSearchParams();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const params = new URLSearchParams(rawSearchParams);
    if (params.has(ADVANCED_COLUMNS_PARAM)) {
      const { cliffsDelta, cles, significance } = parseAdvancedColumns(params);
      dispatch(updateShowCliffsDelta(cliffsDelta));
      dispatch(updateShowCles(cles));
      dispatch(updateShowSignificance(significance));
    }
    if (params.has(EXPANDED_ROW_PARAM)) {
      dispatch(updateExpandedRow(parseExpandedRow(params)));
    }
  }, []);
}

export default useSeedAdvancedOptionsFromUrl;
