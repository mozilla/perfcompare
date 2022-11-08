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
      state.revisions = state.revisions.filter(
        (revision) => revision.id !== action.payload,
      );
    },
    clearSearchResults(state) {
      state.searchResults = initialState.searchResults;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSelectedRevisions.fulfilled, (state, action) => {
      state.searchResults.push(action.payload);
    });
  },
});

export const { setSelectedRevisions, deleteRevision, clearSearchResults } =
  selectedRevisions.actions;
export default selectedRevisions.reducer;
