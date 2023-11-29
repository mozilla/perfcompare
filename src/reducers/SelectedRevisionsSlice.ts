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
    updateEditModeRevisions(
      state,
      action: PayloadAction<{
        selectedRevisions: RevisionsList[];
        isBaseDeletion: boolean;
        isAddChecked: boolean;
      }>,
    ) {
      if (action.payload.isBaseDeletion) {
        state.base = [];
        state.editModeRevisions = action.payload.selectedRevisions;
      }

      if (action.payload.isAddChecked || !action.payload.isBaseDeletion) {
        state.base = [action.payload.selectedRevisions[0]];
        state.new = action.payload.selectedRevisions.slice(1);
        state.editModeRevisions = action.payload.selectedRevisions;
      }
    },

    clearSelectedRevisions() {
      return initialState;
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
  clearSelectedRevisions,
} = selectedRevisions.actions;
export default selectedRevisions.reducer;
