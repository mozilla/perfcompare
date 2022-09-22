import { createSlice } from '@reduxjs/toolkit';

import { fetchCompareResults } from '../thunks/compareResultsThunk';
import type { CompareResultsState } from '../types/state';

const initialState: CompareResultsState = [];

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompareResults.fulfilled, (state, action) => {
        return action.payload;
      })
      // TODO: handle pending status and display loading icon
      // .addCase(fetchCompareResults.pending, (state, action) => {
      //   console.log('pending');
      // })

      // TODO: handle rejected requests and display error message
      .addCase(fetchCompareResults.rejected, () => {});
  },
});

export default compareResults.reducer;
