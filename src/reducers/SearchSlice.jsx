import { createSlice } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const initialState = {
  repository: '',
  searchResults: [],
  searchValue: '',
  errorMessage: null,
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // BEGIN used for testing only
    resetState(state) {
      state.repository = initialState.repository;
      state.searchResults = initialState.searchResults;
      state.searchValue = initialState.searchValue;
      state.errorMessage = initialState.errorMessage;
    },
    // END used for testing only
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
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        state.errorMessage = action.payload;
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        state.errorMessage = action.payload;
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        state.errorMessage = action.payload;
      });
  },
});

export const {
  resetState,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} = search.actions;
export default search.reducer;
