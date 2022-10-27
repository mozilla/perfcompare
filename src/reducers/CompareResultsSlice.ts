import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { CompareResultsItem, CompareResultsState } from '../types/state';

const initialState: CompareResultsState = {
  data: [],
  loading: false,
  error: undefined,
};

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {
    setCompareResults(state, action: PayloadAction<CompareResultsItem[]>) {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompareResults.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = initialState.loading;
      })
      .addCase(fetchCompareResults.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(fetchCompareResults.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = initialState.loading;
      });
  },
});

export const { setCompareResults } = compareResults.actions;
export default compareResults.reducer;
