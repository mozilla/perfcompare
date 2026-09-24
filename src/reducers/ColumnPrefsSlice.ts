import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { ExpandedRowOptions } from '../types/types';
import { parseAdvancedColumns } from '../utils/advancedColumnsUrl';

export const HOW_TO_READ_STORAGE_KEY = 'showHowToRead';
export const MANN_WHITNEY_WARNING_STORAGE_KEY = 'showMannWhitneyWarning';

// Results-view display preferences:
//   - showCliffsDelta / showCles / showSignificance: the advanced statistics
//     columns, toggled independently from the "Advanced options" dropdown.
//     Persisted in the URL (see utils/advancedColumnsUrl) so shared links
//     reproduce the selection. Read from the URL when the store is created, so
//     the very first render already has the right columns — the table's filter
//     and sort hooks read their URL params only once, against the columns
//     present at mount. Default off (the simplified view).
//   - showHowToRead: when true the "How to read the results" helper panel is
//     shown above the table. Persisted to localStorage.
//   - showMannWhitneyWarning: when true the experimental Mann-Whitney-U warning
//     banner is shown (on both the Results and Subtests pages). Persisted to
//     localStorage so dismissing it sticks across reloads and both pages.
//   - expandedRow: visibility of the (power-user) components in the MWU
//     expanded row, toggled from the "Advanced options" dropdown. Persisted in
//     the URL (see utils/expandedRowUrl). All off by default (simplified view).
type ColumnPrefsState = {
  showCliffsDelta: boolean;
  showCles: boolean;
  showSignificance: boolean;
  showHowToRead: boolean;
  showMannWhitneyWarning: boolean;
  expandedRow: ExpandedRowOptions;
};

// Lazy so the URL is read when each store is created rather than at module
// load.
const getInitialState = (): ColumnPrefsState => {
  const advancedColumns = parseAdvancedColumns(window.location.search);
  return {
    showCliffsDelta: advancedColumns.cliffsDelta,
    showCles: advancedColumns.cles,
    showSignificance: advancedColumns.significance,
    showHowToRead: localStorage.getItem(HOW_TO_READ_STORAGE_KEY) !== 'false',
    showMannWhitneyWarning:
      localStorage.getItem(MANN_WHITNEY_WARNING_STORAGE_KEY) !== 'false',
    expandedRow: {
      effectSize: false,
      modes: false,
      statsTable: false,
      warnings: false,
    },
  };
};

const columnPrefs = createSlice({
  name: 'columnPrefs',
  initialState: getInitialState,
  reducers: {
    updateShowCliffsDelta(state, action: PayloadAction<boolean>) {
      state.showCliffsDelta = action.payload;
    },
    updateShowCles(state, action: PayloadAction<boolean>) {
      state.showCles = action.payload;
    },
    updateShowSignificance(state, action: PayloadAction<boolean>) {
      state.showSignificance = action.payload;
    },
    updateShowHowToRead(state, action: PayloadAction<boolean>) {
      state.showHowToRead = action.payload;
      localStorage.setItem(HOW_TO_READ_STORAGE_KEY, String(action.payload));
    },
    updateShowMannWhitneyWarning(state, action: PayloadAction<boolean>) {
      state.showMannWhitneyWarning = action.payload;
      localStorage.setItem(
        MANN_WHITNEY_WARNING_STORAGE_KEY,
        String(action.payload),
      );
    },
    updateExpandedRow(state, action: PayloadAction<ExpandedRowOptions>) {
      state.expandedRow = action.payload;
    },
  },
});

export const {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
  updateShowHowToRead,
  updateShowMannWhitneyWarning,
  updateExpandedRow,
} = columnPrefs.actions;
export default columnPrefs.reducer;
