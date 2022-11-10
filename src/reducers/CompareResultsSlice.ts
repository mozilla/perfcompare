import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { CompareResultsItem, CompareResultsState } from '../types/state';
import { Framework } from '../types/types';

const initialState: CompareResultsState = {
  framework: { id: 1, name: 'talos' },
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
      state.loading = initialState.loading;
    },
    setFramework(state, action: PayloadAction<Framework>) {
      state.framework = action.payload;
      state.data = initialState.data;
    },
    // Used for testing only
    setLoadingStatus(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
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

export const { setCompareResults, setFramework, setLoadingStatus } =
  compareResults.actions;
export default compareResults.reducer;
