import { createSlice } from '@reduxjs/toolkit';

import type { SearchState, SearchStateForInput } from '../types/state';

const DEFAULT_VALUES: SearchStateForInput = undefined;

const initialState: SearchState = {
  base: DEFAULT_VALUES,
  new: DEFAULT_VALUES,
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {},
});

export default search.reducer;
