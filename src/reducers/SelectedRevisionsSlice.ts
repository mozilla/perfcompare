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
    //when the user presses the "Compare"
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
  },
});

export const { setSelectedRevisions } = selectedRevisions.actions;
export default selectedRevisions.reducer;
