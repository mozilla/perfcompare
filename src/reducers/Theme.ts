import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  mode: localStorage.getItem('theme') || 'light',
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
