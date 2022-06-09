import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { AlertState, AlertType } from '../types/state';

const initialState: AlertState = {
  isAlert: false,
  alert: {
    message: '',
    title: undefined,
    severity: undefined,
  },
};

const alert = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    clearAlert(state) {
      state.isAlert = initialState.isAlert;
      state.alert = initialState.alert;
    },
    setAlert(state, action: PayloadAction<AlertType>) {
      state.isAlert = true;
      state.alert = action.payload;
    },
  },
});

export const { clearAlert, setAlert } = alert.actions;
export default alert.reducer;
