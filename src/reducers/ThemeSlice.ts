import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ThemeMode } from '../types/state';

const initialState = {
  mode:
    localStorage.getItem('theme') === 'dark' ? 'dark' : ('light' as ThemeMode),
};

const theme = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { updateThemeMode } = theme.actions;
export default theme.reducer;
