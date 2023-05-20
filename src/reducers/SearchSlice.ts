import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type { Repository, Revision, SearchState } from '../types/state';


const initialState: SearchState = {
  // base repository to search, string
  baseRepository: 'try',
  // new repository to search, string
  newRepository: 'try',
  // results of search, array of revisions
  searchResults: [],
  // results of base search, array of revisions
  baseSearchResults: [],
  // results of new search, array of revisions
  newSearchResults: [],
  // search value, string, 12- or 40- hash, or author email
  searchValue: '',
  // error if search input returns error, or no results found
  inputErrorBase: false,
  // helper text for search input
  inputErrorNew: false,
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
      //keeping the old searchResults until searchview beta is complete
      state.searchResults = action.payload.payload;
      //depending on the repository selected on dropdown, searchType, update the search results for that repository, base or new
      state.baseSearchResults =
        action.payload.searchType === 'base'
          ? action.payload.payload
          : state.baseSearchResults;

      state.newSearchResults =
        action.payload.searchType === 'new'
          ? action.payload.payload
          : state.newSearchResults;
    },

    updateBaseRepository(state, action: PayloadAction<Repository['name']>) {
      state.baseRepository = action.payload;
    },

    updateNewRepository(state, action: PayloadAction<Repository['name']>) {
      state.newRepository = action.payload;
    },

    setInputErrorBase(state, action: PayloadAction<string>) {
      state.inputErrorBase = true;
      state.inputHelperText = action.payload;
    },

    setInputErrorNew(state, action: PayloadAction<string>) {
      state.inputErrorNew = true;
      state.inputHelperText = action.payload;
    },

    clearInputErrorBase(state) {
      state.inputErrorBase = false;
      state.inputHelperText = '';
    },
    clearInputErrorNew(state) {
      state.inputErrorNew = false;
      state.inputHelperText = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRecentRevisions
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.baseSearchResults =
          action.meta.arg.searchType == 'base'
            ? action.payload
            : state.baseSearchResults;
        state.newSearchResults =
          action.meta.arg.searchType == 'new'
            ? action.payload
            : state.newSearchResults;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        state.inputErrorBase = action.payload?.searchType == 'base' ?? true;
        state.inputErrorNew = action.payload?.searchType == 'new' ?? true;

        state.inputHelperText = action.payload?.error
          ? action.payload?.error
          : 'An error has occurred';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.baseSearchResults =
          action.meta.arg.searchType == 'base'
            ? action.payload
            : state.baseSearchResults;
        state.newSearchResults =
          action.meta.arg.searchType == 'new'
            ? action.payload
            : state.newSearchResults;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        state.inputErrorBase = action.payload?.searchType == 'base' ?? true;
        state.inputErrorNew = action.payload?.searchType == 'new' ?? true;
        state.inputHelperText = action.payload?.error
          ? action.payload?.error
          : 'An error has occurred';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.baseSearchResults =
          action.meta.arg.searchType == 'base'
            ? action.payload
            : state.baseSearchResults;
        state.newSearchResults =
          action.meta.arg.searchType == 'new'
            ? action.payload
            : state.newSearchResults;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        state.inputErrorBase = action.payload?.searchType == 'base' ?? true;
        state.inputErrorNew = action.payload?.searchType == 'new' ?? true;
        state.inputHelperText = action.payload?.error
          ? action.payload?.error
          : 'An error has occurred';
      });
  },
});

export const {
  updateSearchValue,
  updateSearchResults,
  updateBaseRepository,
  updateNewRepository,
  setInputErrorBase,
  setInputErrorNew,
  clearInputErrorNew,
  clearInputErrorBase,
} = search.actions;
export default search.reducer;
