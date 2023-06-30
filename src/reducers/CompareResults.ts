import { createSlice } from '@reduxjs/toolkit';

import { comparisonResults as firstRevisionResults } from '../mockData/3c72ca1b13e1';
import { comparisonResults as secondRevisionResults } from '../mockData/b4b491b3ca96';
import { comparisonResults as thirdRevisionResults } from '../mockData/d0df2e2dd962';
import type { CompareResultsState } from '../types/state';

const comparisonResults = firstRevisionResults.concat(secondRevisionResults, thirdRevisionResults);

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
