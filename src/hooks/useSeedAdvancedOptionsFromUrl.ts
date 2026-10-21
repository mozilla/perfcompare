import { useEffect } from 'react';

import { useAppDispatch } from './app';
import useRawSearchParams from './useRawSearchParams';
import {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
  updateExpandedRow,
} from '../reducers/ColumnPrefsSlice';
import { resolveAdvancedOptions } from '../utils/advancedOptionsUrl';

// On mount, seed the Advanced options in Redux from the URL or cookie (see
// resolveAdvancedOptions). A group neither specifies is left as is. Call once
// per results view.
function useSeedAdvancedOptionsFromUrl() {
  const [rawSearchParams] = useRawSearchParams();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const { columns, expandedRow } = resolveAdvancedOptions(rawSearchParams);
    if (columns) {
      dispatch(updateShowCliffsDelta(columns.cliffsDelta));
      dispatch(updateShowCles(columns.cles));
      dispatch(updateShowSignificance(columns.significance));
    }
    if (expandedRow) {
      dispatch(updateExpandedRow(expandedRow));
    }
  }, []);
}

export default useSeedAdvancedOptionsFromUrl;
