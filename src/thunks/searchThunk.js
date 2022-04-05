import { createAsyncThunk } from '@reduxjs/toolkit';

const treeherderBaseURL = 'https://treeherder.mozilla.org';

export const fetchRecentRevisions = createAsyncThunk(
  'search/fetchRecentRevisions',
  async (repository, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/`,
      )
        .then((res) => res.json())
        .then((res) => res.results);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
    return response;
  },
);

export const fetchRevisionByID = createAsyncThunk(
  'search/fetchRevisionByID',
  async ({ repository, search }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?revision=${search}`,
      )
        .then((res) => res.json())
        .then((res) => res.results);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
    return response;
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk(
  'search/fetchRevisionsByAuthor',
  async ({ repository, search }, rejectWithValue) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?author=${search}`,
      )
        .then((res) => res.json())
        .then((res) => res.results);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
    return response;
  },
);
