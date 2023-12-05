import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchRevisionByID } from '../thunks/searchThunk';
import { RevisionsList, SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [],
  base: [],
  new: [],
  editModeRevisions: [],
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
      state.base = [action.payload.selectedRevisions[0]];
      //returns array without first element
      state.new = action.payload.selectedRevisions.slice(1);
      state.editModeRevisions = action.payload.selectedRevisions;
    },
    //when the users presses the "Save" button in edit mode
    saveUpdatedRevisions(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      state.base = [action.payload.selectedRevisions[0]];
      //returns array without first element
      state.new = action.payload.selectedRevisions.slice(1);
      state.editModeRevisions = action.payload.selectedRevisions;
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
        state.base = [];
        state.editModeRevisions = action.payload.selectedRevisions;
        return;
      }

      state.base = [action.payload.selectedRevisions[0]];
      state.new = action.payload.selectedRevisions.slice(1);
      state.editModeRevisions = action.payload.selectedRevisions;
    },
    //when the user checks a revision in search dropdown in edit mode
    updateEditModeRevisionsForCheckAddition(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
      }>,
    ) {
      state.base = [action.payload.selectedRevisions[0]];
      state.new = action.payload.selectedRevisions.slice(1);
      state.editModeRevisions = action.payload.selectedRevisions;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchRevisionByID.fulfilled, (state, action) => {
      const fetchedRevisions = state.revisions
        .concat(action.payload[0])
        .filter(
          (revision, index, self) =>
            self.findIndex((r) => r.id === revision.id) === index,
        );

      state.revisions = fetchedRevisions;
      state.base = [fetchedRevisions[0]];
      state.new = fetchedRevisions.slice(1);
      state.editModeRevisions = fetchedRevisions;
    });
    //Need to handle error case
  },
});

export const {
  setSelectedRevisions,
  saveUpdatedRevisions,
  updateEditModeRevisions,
  updateEditModeRevisionsForCheckAddition,
} = selectedRevisions.actions;
export default selectedRevisions.reducer;
