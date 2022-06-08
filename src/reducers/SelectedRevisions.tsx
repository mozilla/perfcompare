import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Revision, SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [],
};

const selectedRevisions = createSlice({
  name: 'selectedRevisions',
  initialState,
  reducers: {
    resetState(state) {
      state.revisions = initialState.revisions;
    },
    setSelectedRevisions(state, action: PayloadAction<Revision[]>) {
      state.revisions = action.payload;
    },
    deleteRevision(state, action) {
      return {
        revisions: state.revisions.filter(
          (revision) => revision.id !== action.payload,
        ),
      };
    },
  },
});

export const { resetState, setSelectedRevisions, deleteRevision } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
