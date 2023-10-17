import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RevisionsList, SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [],
  base: [],
  new: [],
};

const selectedRevisions = createSlice({
  name: 'selectedRevisions',
  initialState,
  reducers: {
    setSelectedRevisions(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      state.revisions = action.payload.selectedRevisions;
      state.base = [action.payload.selectedRevisions[0]];
      //returns array without first element
      state.new = action.payload.selectedRevisions.slice(1);
    },
    deleteRevision(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      return {
        ...state,
        revisions: action.payload.selectedRevisions,
        new: action.payload.selectedRevisions.slice(1),
      };
    },

    clearSelectedRevisions() {
      return initialState;
    },
  },
});

export const { setSelectedRevisions, deleteRevision, clearSelectedRevisions } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
