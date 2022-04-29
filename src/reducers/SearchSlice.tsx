import { createSlice } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const initialState = {
  // true if search input is focused
  searchIsFocused: false,
  // repository to search, string
  repository: 'try',
  // results of search, array of revisions
  searchResults: [],
  // search value, string, 12- or 40- hash, or author email
  searchValue: '',
  // error if search input returns error, or no results found
  inputError: false,
  // helper text for search input
  inputHelperText: '',
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // BEGIN used for testing only
    resetState(state) {
      state.repository = initialState.repository;
      state.searchIsFocused = initialState.searchIsFocused;
      state.searchResults = initialState.searchResults;
      state.searchValue = initialState.searchValue;
      state.inputError = initialState.inputError;
      state.inputHelperText = initialState.inputHelperText;
    },
    // END used for testing only
    updateSearchIsFocused(state, action) {
      state.searchIsFocused = action.payload;
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
    setInputError(state, action) {
      state.inputError = true;
      state.inputHelperText = action.payload;
    },
    clearInputError(state) {
      state.inputError = false;
      state.inputHelperText = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRecentRevisions
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        state.inputError = true;
        state.inputHelperText = action.payload;
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        state.inputError = true;
        state.inputHelperText = action.payload;
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        state.inputError = true;
        state.inputHelperText = action.payload;
      });
  },
});

export const {
  resetState,
  updateSearchIsFocused,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
  setInputError,
  clearInputError,
} = search.actions;
export default search.reducer;
