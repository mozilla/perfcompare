import { createSlice } from '@reduxjs/toolkit';

import { comparisonResults } from '../mockData/3c72ca1b13e1';
import type { CompareResultsState } from '../types/state';


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
