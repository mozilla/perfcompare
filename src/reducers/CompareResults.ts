import { createSlice } from '@reduxjs/toolkit';

import { comparisonResults as secondRevisionResults } from '../mockData/9d5066525489';
import { comparisonResults as thirdRevisionResults } from '../mockData/a998c42399a8';
import { comparisonResults as firstRevisionResults } from '../mockData/bb6a5e451dac';
import type { CompareResultsState } from '../types/state';

const comparisonResults = firstRevisionResults.concat(
  secondRevisionResults,
  thirdRevisionResults,
);

const initialState: CompareResultsState = {
  data: [],
  loading: false,
  error: undefined,
};

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {
    switchToFakeData(state) {
      state.data = comparisonResults;
    },
  },
});

export const { switchToFakeData } = compareResults.actions;
export default compareResults.reducer;
