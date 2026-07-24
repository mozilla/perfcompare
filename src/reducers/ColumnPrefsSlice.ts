import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Results-view display preferences:
//   - showCliffsDelta / showCles: the two advanced statistics columns, toggled
//     independently from the "Advanced columns" dropdown. Persisted in the URL
//     (see utils/advancedColumnsUrl) so shared links reproduce the selection;
//     seeded into this slice on mount. Default off (the simplified view).
//   - showHowToRead: when true the "How to read the results" helper panel is
//     shown above the table. Persisted to localStorage.
const initialState: {
  showCliffsDelta: boolean;
  showCles: boolean;
  showHowToRead: boolean;
} = {
  showCliffsDelta: false,
  showCles: false,
  showHowToRead: localStorage.getItem('showHowToRead') !== 'false',
};

const columnPrefs = createSlice({
  name: 'columnPrefs',
  initialState,
  reducers: {
    updateShowCliffsDelta(state, action: PayloadAction<boolean>) {
      state.showCliffsDelta = action.payload;
    },
    updateShowCles(state, action: PayloadAction<boolean>) {
      state.showCles = action.payload;
    },
    updateShowHowToRead(state, action: PayloadAction<boolean>) {
      state.showHowToRead = action.payload;
    },
  },
});

export const { updateShowCliffsDelta, updateShowCles, updateShowHowToRead } =
  columnPrefs.actions;
export default columnPrefs.reducer;
