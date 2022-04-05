import { createSlice } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const initialState = {
  recentRevisions: [],
  repository: '',
  searchResults: [],
  searchValue: '',
  loading: 'idle',
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    updateLoadingState(state, action) {
      state.loading = action.payload;
    },
    updateSearchValue(state, action) {
      state.searchValue = action.payload;
    },
    updateSearchResults(state, action) {
      state.searchResults = action.payload;
    },
    updateRepository(state, action) {
      state.repository = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRecentRevisions
      .addCase(fetchRecentRevisions.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.recentRevisions = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state) => {
        state.loading = 'failed';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state) => {
        state.loading = 'failed';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state) => {
        state.loading = 'failed';
      });
  },
});

export const {
  updateLoadingState,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} = search.actions;
export default search.reducer;
