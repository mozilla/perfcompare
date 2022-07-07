import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Revision, RevisionsState } from '../types/state';

const initialState: RevisionsState = {
  checkedRevisions: [],
  selectedRevisions: [],
};

const revisions = createSlice({
  name: 'revisions',
  initialState,
  reducers: {
    setCheckedRevisions(state, action: PayloadAction<number[]>) {
      state.checkedRevisions = action.payload;
    },
    clearCheckedRevisions(state) {
      state.checkedRevisions = initialState.checkedRevisions;
    },
    setSelectedRevisions(state, action: PayloadAction<Revision[]>) {
      state.selectedRevisions = action.payload;
      state.checkedRevisions = initialState.checkedRevisions;
    },
    deleteSelectedRevision(state, action) {
      state.selectedRevisions = state.selectedRevisions.filter(
        (revision) => revision.id !== action.payload,
      );
    },
  },
});

export const {
  setCheckedRevisions,
  clearCheckedRevisions,
  setSelectedRevisions,
  deleteSelectedRevision,
} = revisions.actions;

export default revisions.reducer;
