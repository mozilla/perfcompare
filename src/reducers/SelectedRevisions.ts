import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchRevisionByID } from "../thunks/searchThunk";
import { Revision, SelectedRevisionsState } from "../types/state";

const initialState: SelectedRevisionsState = {
  revisions: [],
};

const selectedRevisions = createSlice({
  name: "selectedRevisions",
  initialState,
  reducers: {
    setSelectedRevisions(state, action: PayloadAction<Revision[]>) {
      state.revisions = action.payload;
    },
    deleteRevision(state, action) {
      return {
        revisions: state.revisions.filter(
          (revision) => revision.id !== action.payload
        ),
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRevisionByID.fulfilled, (state, action) => {
      state.revisions = state.revisions
        .concat(action.payload[0])
        .filter(
          (revision, index, self) =>
            self.findIndex((r) => r.id === revision.id) === index
        );
    });
  },
});

export const { setSelectedRevisions, deleteRevision } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
