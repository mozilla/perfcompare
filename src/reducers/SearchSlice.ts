import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type { Repository, Revision, SearchState } from '../types/state';

const initialState: SearchState = {
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
    updateSearchValue(state, action: PayloadAction<string>) {
      state.searchValue = action.payload;
    },
    updateSearchResults(
      state,
      action: PayloadAction<{
        payload: Revision[];
        searchType: 'base' | 'new';
      }>,
    ) {
      state.searchResults = action.payload.payload;

      state.baseSearchResults =
        action.payload.searchType == 'base'
          ? action.payload.payload
          : state.baseSearchResults;

      state.newSearchResults =
        action.payload.searchType == 'new'
          ? action.payload.payload
          : state.newSearchResults;
    },

    updateBaseRepository(state, action: PayloadAction<Repository['name']>) {
      state.baseRepository = action.payload;
    },
    setInputError(state, action: PayloadAction<string>) {
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
        state.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        state.inputError = true;
        state.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        state.inputError = true;
        state.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      });
  },
});

export const {
  updateSearchValue,
  updateSearchResults,
  updateRepository,
  setInputError,
  clearInputError,
} = search.actions;
export default search.reducer;
