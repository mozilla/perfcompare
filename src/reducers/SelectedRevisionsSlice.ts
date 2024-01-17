import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RevisionsList, SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [],
  baseCommittedRevisions: [],
  newCommittedRevisions: [],
};

const selectedRevisions = createSlice({
  name: 'selectedRevisions',
  initialState,
  reducers: {
    //when the user presses the "Compare" or "Cancel" (in edit mode) buttons
    setSelectedRevisions(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      state.revisions = action.payload.selectedRevisions;
      state.baseCommittedRevisions = [action.payload.selectedRevisions[0]];
      //returns array without first element
      state.newCommittedRevisions = action.payload.selectedRevisions.slice(1);
    },

    //when the user clicks the "X" button on selected revisions
    updateEditModeRevisions(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
        isBaseDeletion: boolean;
      }>,
    ) {
      if (action.payload.isBaseDeletion) {
        state.baseCommittedRevisions = [];
        return;
      }

      state.baseCommittedRevisions = [action.payload.selectedRevisions[0]];
      state.newCommittedRevisions = action.payload.selectedRevisions.slice(1);
    },
    //when the user checks a revision in search dropdown in edit mode
    updateEditModeRevisionsForCheckAddition(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      state.baseCommittedRevisions = [action.payload.selectedRevisions[0]];
      state.newCommittedRevisions = action.payload.selectedRevisions.slice(1);
    },
  },
});

export const {
  setSelectedRevisions,
  updateEditModeRevisions,
  updateEditModeRevisionsForCheckAddition,
} = selectedRevisions.actions;
export default selectedRevisions.reducer;
