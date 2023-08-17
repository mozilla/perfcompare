import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    setCompareData(
      state,
      action: PayloadAction<{
        data: CompareResultsItem[];
      }>,
    ) {
      state.data = action.payload.data;
    },
  },
});

export const { setCompareData } = compareResults.actions;
export default compareResults.reducer;
