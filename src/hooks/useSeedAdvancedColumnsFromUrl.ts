import { useEffect } from 'react';

import { useAppDispatch } from './app';
import {
  updateShowCliffsDelta,
  updateShowCles,
} from '../reducers/ColumnPrefsSlice';
import {
  ADVANCED_COLUMNS_PARAM,
  parseAdvancedColumns,
} from '../utils/advancedColumnsUrl';

// On mount, seed the advanced-column visibility from the URL so a shared link
// reproduces the selected columns. Toggling updates both the URL (for sharing)
// and Redux (for reactive rendering); this only handles the initial
// URL → Redux direction. Call once per results view.
function useSeedAdvancedColumnsFromUrl() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(ADVANCED_COLUMNS_PARAM)) {
      return;
    }
    const { cliffsDelta, cles } = parseAdvancedColumns(params);
    dispatch(updateShowCliffsDelta(cliffsDelta));
    dispatch(updateShowCles(cles));
  }, []);
}

export default useSeedAdvancedColumnsFromUrl;
