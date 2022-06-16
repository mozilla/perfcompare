import { createSlice } from '@reduxjs/toolkit';

// TODO: replace with thunk that accesses endpoint
// import { fetchCompareResults } from '../thunks/fetchCompareResults';
import type { CompareResultsState } from '../types/state';

const initialState: CompareResultsState = [
  // test values until we can fetch data from API
  {
    platformName: 'Linux x64 asan',
    testName: 'a11y',
    baseValue: 300,
    newValue: 150,
    delta: -50,
    confidenceText: 'high',
    baseRuns: 1,
    newRuns: 1,
  },
  {
    platformName: 'OS X Cross Compiled opt',
    testName: 'a11y',
    baseValue: 300,
    newValue: 150,
    delta: -50,
    confidenceText: 'high',
    baseRuns: 1,
    newRuns: 1,
  },
  {
    platformName: 'Android 4.1 ARMv7 opt',
    testName: 'a11y',
    baseValue: 300,
    newValue: 150,
    delta: -50,
    confidenceText: 'high',
    baseRuns: 1,
    newRuns: 1,
  },
  {
    platformName: 'Windows 2012 opt',
    testName: 'a11y',
    baseValue: 300,
    newValue: 150,
    delta: -50,
    confidenceText: 'high',
    baseRuns: 1,
    newRuns: 1,
  },
];

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
