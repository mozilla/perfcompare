import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  SearchState,
  SearchStateForInput,
  InputType,
} from '../types/state';

const DEFAULT_VALUES: SearchStateForInput = {
  inputError: false,
  inputHelperText: '',
};

const initialState: SearchState = {
  base: DEFAULT_VALUES,
  new: DEFAULT_VALUES,
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setInputError(
      state,
      action: PayloadAction<{
        errorMessage: string;
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].inputError = true;
      state[type].inputHelperText = action.payload.errorMessage;
    },
  },
});

export const { setInputError } = search.actions;
export default search.reducer;
