import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { CompareResultsState, ResultsHashmap } from '../types/state';

const initialState: CompareResultsState = {
  data: {},
  loading: false,
  error: undefined,
};

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {
    setCompareData(
      state,
      action: PayloadAction<{
        data: ResultsHashmap;
      }>,
    ) {
      state.data = action.payload.data;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompareResults.fulfilled, (state, action) => {
        const revisionHash = action.payload[0].new_rev;
        state.data[revisionHash] = action.payload;
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

export const { setCompareData } = compareResults.actions;
export default compareResults.reducer;
