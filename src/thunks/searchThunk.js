import { createAsyncThunk } from '@reduxjs/toolkit';

const treeherderBaseURL = 'https://treeherder.mozilla.org';

export const fetchRecentRevisions = createAsyncThunk(
  'search/fetchRecentRevisions',
  async (repository, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/`,
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
    const json = await response.json();
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);

export const fetchRevisionByID = createAsyncThunk(
  'search/fetchRevisionByID',
  async ({ repository, search }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?revision=${search}`,
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
    const json = await response.json();
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk(
  'search/fetchRevisionsByAuthor',
  async ({ repository, search }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?author=${search}`,
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
    const json = await response.json();
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);
