import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type {
  Repository,
  RevisionsList,
  SearchState,
  InputType,
} from '../types/state';

const initialState: SearchState = {
  base: {
    // repository to search, string
    repository: 'try',
    // results of base search, array of revisions
    searchResults: [],
    // search value, string, 12- or 40- hash, or author email
    searchValue: '',
    // error if search input returns error, or no results found
    inputError: false,
    inputHelperText: '',
  },
  new: {
    repository: 'try',
    searchResults: [],
    searchValue: '',
    inputError: false,
    inputHelperText: '',
  },
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    updateSearchValue(
      state,
      action: PayloadAction<{
        search: string;
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].searchValue = action.payload.search;
    },
    //rename payload to more informative names
    updateSearchResults(
      state,
      action: PayloadAction<{
        results: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].searchResults = action.payload.results;
      state[type].inputError = false;
      state[type].inputHelperText = '';
    },

    updateRepository(
      state,
      action: PayloadAction<{
        repository: Repository['name'];
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].repository = action.payload.repository;
    },

    setInputError(
      state,
      action: PayloadAction<{
        errorMessage: string;
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].inputError = true;
      state[type].inputHelperText = action.payload.errorMessage;
    },

    // clearInputError(
    //   state,
    //   action: PayloadAction<{
    //     searchType: InputType;
    //   }>,
    // ) {
    //   const type = action.payload.searchType;
    //   state[type].inputError = false;
    //   state[type].inputHelperText = '';
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].inputError = true;

        state[type].inputHelperText = action.payload?.error
          ? action.payload.error
          : 'An error has occurred';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].inputError = true;
        state[type].inputHelperText = action.payload?.error
          ? action.payload.error
          : 'An error has occurred';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        const type = action.meta.arg.searchType ;
        state[type].inputError = true;
        state[type].inputHelperText = action.payload?.error
          ? action.payload.error
          : 'An error has occurred';
      });
  },
});

export const {
  updateSearchValue,
  updateSearchResults,
  updateRepository,
  setInputError,
} = search.actions;
export default search.reducer;
