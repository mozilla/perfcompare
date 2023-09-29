import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';
import type {
  Repository,
  RevisionsList,
  SearchStateForInput,
  InputType,
} from '../types/state';

const DEFAULT_VALUES: SearchStateForInput = {
  repository: 'try',
  searchResults: [],
  searchValue: '',
  inputError: false,
  inputHelperText: '',
  checkedRevisions: [],
};

const initialStateFramework = {
  id: 1,
  name: 'talos',
};

const initialTimeRange = {
  seconds: 86400,
  text: 'Last day',
};

const initialState = {
  new: DEFAULT_VALUES,
  framework: initialStateFramework,
  timerange: initialTimeRange,
};

const searchCompareOverTime = createSlice({
  name: 'searchCompareOverTime',
  initialState,
  reducers: {
    updateSearchValue(
      state,
      action: PayloadAction<{
        search: string;
        searchType: InputType;
      }>,
    ) {
      state.new.searchValue = action.payload.search;
    },
    // TODO: rename payload to more informative names
    updateSearchResults(
      state,
      action: PayloadAction<{
        results: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      state.new.searchResults = action.payload.results;
      state.new.inputError = false;
      state.new.inputHelperText = '';
    },

    updateRepository(
      state,
      action: PayloadAction<{
        repository: Repository['name'];
        searchType: InputType;
      }>,
    ) {
      state.new.repository = action.payload.repository;
    },

    updateFramework(
      state,
      action: PayloadAction<{
        id: number;
        name: string;
      }>,
    ) {
      state.framework.id = action.payload.id;
      state.framework.name = action.payload.name;
    },

    updateTimeRange(
      state,
      action: PayloadAction<{
        seconds: number;
        text: string;
      }>,
    ) {
      state.timerange.seconds = action.payload.seconds;
      state.timerange.text = action.payload.text;
    },

    updateCheckedRevisions(
      state,
      action: PayloadAction<{
        newChecked: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      state.new.checkedRevisions = action.payload.newChecked;
    },

    clearCheckedRevisions(state) {
      state.new.checkedRevisions = initialState.new.checkedRevisions;
    },

    clearCheckedRevisionforType(state) {
      state.new.checkedRevisions = initialState.new.checkedRevisions;
    },

    setCheckedRevisionsForEdit(
      state,
      action: PayloadAction<{
        revisions: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      state.new.checkedRevisions = action.payload.revisions;
    },

    setInputError(
      state,
      action: PayloadAction<{
        errorMessage: string;
        searchType: InputType;
      }>,
    ) {
      state.new.inputError = true;
      state.new.inputHelperText = action.payload.errorMessage;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        state.new.searchResults = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        state.new.inputError = true;

        state.new.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        state.new.searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        state.new.inputError = true;
        state.new.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        state.new.searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        state.new.inputError = true;
        state.new.inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      });
  },
});

export const {
  updateSearchValue,
  updateSearchResults,
  updateRepository,
  updateCheckedRevisions,
  clearCheckedRevisions,
  clearCheckedRevisionforType,
  setInputError,
  setCheckedRevisionsForEdit,
  updateFramework,
} = searchCompareOverTime.actions;
export default searchCompareOverTime.reducer;
