import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchRevisionByID } from '../thunks/searchThunk';
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
    },
    deleteRevision(
      state,
      action: PayloadAction<{ selectedRevision: RevisionsList }>,
    ) {
      return {
        ...state,
        revisions: state.revisions.filter(
          (revision) => revision.id !== action.payload.selectedRevision.id,
        ),
      };
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
      state.new = fetchedRevisions.filter((_, index) => index !== 0);
    });
    //Need to handle error case
  },
});

export const { setSelectedRevisions, deleteRevision, clearSelectedRevisions } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
