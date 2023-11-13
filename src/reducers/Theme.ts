import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light',
};

const theme = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateThemeMode(state, action: PayloadAction<string>) {
      state.mode = action.payload;
    },
  },
});

export const { updateThemeMode } = theme.actions;
export default theme.reducer;
