import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchSelectedRevisions } from '../thunks/selectedRevisionsThunk';
import { Revision, SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [],
  errorMessage: '',
  status: 'idle',
  searchResults: [],
};

const selectedRevisions = createSlice({
  name: 'selectedRevisions',
  initialState,
  reducers: {
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
    clearSelectedRevisions(state) {
      state.revisions = initialState.revisions;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSelectedRevisions.fulfilled, (state, action) => {
      state.searchResults.push(action.payload);
    });
  },
});

export const { setSelectedRevisions, deleteRevision, clearSelectedRevisions } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
