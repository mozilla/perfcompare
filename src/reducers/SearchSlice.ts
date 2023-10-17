import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type {
  Repository,
  RevisionsList,
  SearchState,
  SearchStateForInput,
  InputType,
} from '../types/state';

interface FetchDataArgs {
  repository: Repository['name'];
  searchType: InputType;
}

interface FetchDataArgsIDEmail {
  repository: Repository['name'];
  search: string;
  searchType: InputType;
}

export const fetchRecentRevisions = createAsyncThunk<
  RevisionsList[],
  FetchDataArgs,
  { rejectValue: string }
>(
  'search/fetchRecentRevisions',
  // searchType is used in the reducer but not in this function.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ repository, searchType }, { rejectWithValue }) => {
    let response;

    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
      );
    } catch (err) {
      const error = (err as Error).message;
      console.error('FetchRecentRevisions ERROR: ', error);
      return rejectWithValue(error);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }
    return rejectWithValue('No results found');
  },
);

export const fetchRevisionByID = createAsyncThunk<
  RevisionsList[],
  FetchDataArgsIDEmail,
  { rejectValue: string }
>(
  'search/fetchRevisionByID',
  // searchType is used in the reducer but not in this function.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ repository, search, searchType }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?revision=${search}`,
      );
    } catch (err) {
      const error = err as Error;
      console.error('FetchRevisionByID ERROR: ', error);
      return rejectWithValue(error.message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }
    return rejectWithValue('No results found');
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk<
  RevisionsList[],
  FetchDataArgsIDEmail,
  { rejectValue: string }
>(
  'search/fetchRevisionsByAuthor',
  // searchType is used in the reducer but not in this function.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ repository, search, searchType }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?author=${search}`,
      );
    } catch (err) {
      const error = err as Error;
      console.error('FetchRevisionsByAuthor ERROR: ', error);
      return rejectWithValue(error.message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }
    return rejectWithValue('No results found');
  },
);

const DEFAULT_VALUES: SearchStateForInput = {
  repository: 'try',
  searchResults: [],
  searchValue: '',
  inputError: false,
  inputHelperText: '',
  checkedRevisions: [],
};

const initialState: SearchState = {
  base: DEFAULT_VALUES,
  new: DEFAULT_VALUES,
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

    updateCheckedRevisions(
      state,
      action: PayloadAction<{
        newChecked: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].checkedRevisions = action.payload.newChecked;
    },

    clearCheckedRevisions(state) {
      state.base.checkedRevisions = initialState.base.checkedRevisions;
      state.new.checkedRevisions = initialState.new.checkedRevisions;
    },

    clearCheckedRevisionforType(
      state,
      action: PayloadAction<{
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].checkedRevisions = initialState[type].checkedRevisions;
    },

    setCheckedRevisionsForEdit(
      state,
      action: PayloadAction<{
        revisions: RevisionsList[];
        searchType: InputType;
      }>,
    ) {
      const type = action.payload.searchType;
      state[type].checkedRevisions = action.payload.revisions;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRecentRevisions.rejected, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].inputError = true;

        state[type].inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionByID
      .addCase(fetchRevisionByID.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRevisionByID.rejected, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].inputError = true;
        state[type].inputHelperText = action.payload
          ? action.payload
          : 'An error has occurred';
      })
      // fetchRevisionsByAuthor
      .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].searchResults = action.payload;
      })
      .addCase(fetchRevisionsByAuthor.rejected, (state, action) => {
        const type = action.meta.arg.searchType;
        state[type].inputError = true;
        state[type].inputHelperText = action.payload
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
} = search.actions;
export default search.reducer;
