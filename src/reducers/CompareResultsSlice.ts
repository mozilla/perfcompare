import { createSlice } from '@reduxjs/toolkit';

// TODO: replace with thunk that accesses endpoint
// import { fetchCompareResults } from '../thunks/fetchCompareResults';
import { comparisonResults } from '../common/mockResultsData';
import type { CompareResultsState } from '../types/state';

// test values until we can fetch data from API
const initialState: CompareResultsState = comparisonResults;

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {},
  // TODO: replace with reducer to handle thunk
  //   extraReducers: (builder) => {
  //     builder.addCase(fetchCompareResults.fulfilled, (state, action) => {
  //       state = action.payload;
  //     });
  //   },
});

// TODO: add actions
// export const {} = results.actions;
export default compareResults.reducer;
