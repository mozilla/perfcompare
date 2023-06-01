import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CheckedRevisionsState } from '../types/state';
import type { RevisionsList } from '../types/state';

const initialState: CheckedRevisionsState = {
  revisions: [],
};

const checkedRevisions = createSlice({
  name: 'checkedRevisions',
  initialState,
  reducers: {
    clearCheckedRevisions(state) {
      state.revisions = initialState.revisions;
    },
    setCheckedRevisions(state, action: PayloadAction<RevisionsList[]>) {
      state.revisions = action.payload;
    },
  },
});

export const { clearCheckedRevisions, setCheckedRevisions } =
  checkedRevisions.actions;
export default checkedRevisions.reducer;
