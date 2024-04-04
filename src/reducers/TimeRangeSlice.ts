import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TimeRange } from '../types/types';

const initialState = {
  value: 86400,
  text: 'Last day',
};

const timeRange = createSlice({
  name: 'timerange',
  initialState,
  reducers: {
    updateTimeRange(
      state,
      action: PayloadAction<{
        value: TimeRange['value'];
        text: TimeRange['text'];
      }>,
    ) {
      state.value = action.payload.value;
      state.text = action.payload.text;
    },
  },
});

export const { updateTimeRange } = timeRange.actions;
export default timeRange.reducer;
