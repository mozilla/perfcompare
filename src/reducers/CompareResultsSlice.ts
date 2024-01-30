import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchCompareResults,
  fetchFakeResults,
} from '../thunks/compareResultsThunk';
import type {
  CompareResultsState,
  CompareResultsItem,
  ResultsHashmap,
} from '../types/state';

const initialState: CompareResultsState = {
  data: {} as ResultsHashmap,
  loading: false,
  error: undefined,
};

function fetchPending(state: CompareResultsState) {
  state.loading = true;
  state.error = initialState.error;
}

function fetchFulfilled(
  state: CompareResultsState,
  action: PayloadAction<CompareResultsItem[]>,
) {
  const revisionHash = action.payload[0].new_rev;
  state.data[revisionHash] = action.payload;
  state.loading = initialState.loading;
}

function fetchRejected(
  state: CompareResultsState,
  action: PayloadAction<string | undefined>,
) {
  state.error = action.payload;
  state.loading = initialState.loading;
}

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompareResults.pending, fetchPending)
      .addCase(fetchFakeResults.pending, fetchPending)
      .addCase(fetchCompareResults.fulfilled, fetchFulfilled)
      .addCase(fetchFakeResults.fulfilled, fetchFulfilled)
      .addCase(fetchCompareResults.rejected, fetchRejected)
      .addCase(fetchFakeResults.rejected, fetchRejected);
  },
});

export default compareResults.reducer;
