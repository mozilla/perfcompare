import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState {
  activeComparison: string;
}

const initialState: InitialState = {
  activeComparison: 'All revisions',
};

const comparison = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    updateComparison(
      state,
      action: PayloadAction<{
        activeComparison: string;
      }>,
    ) {
      state.activeComparison = action.payload.activeComparison;
    },
  },
});

export const { updateComparison } = comparison.actions;

export default comparison.reducer;
