/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type { Repository, Revision } from '../types/state';

export const fetchRecentRevisions = createAsyncThunk<
  Revision[],
  { repository: Repository['name']; searchType: string },
  { rejectValue: string }
>(
  'search/fetchRecentRevisions',
  //searchType is not used here, but is needed to be passed in to the thunk
  async ({ repository, searchType }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
      );
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);

export const fetchRevisionByID = createAsyncThunk<
  Revision[],
  { repository: Repository['name']; search: string; searchType: string },
  { rejectValue: string }
>(
  'search/fetchRevisionByID',
  async ({ repository, search }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?revision=${search}`,
      );
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk<
  Revision[],
  { repository: Repository['name']; search: string; searchType: string },
  { rejectValue: string }
>(
  'search/fetchRevisionsByAuthor',
  async ({ repository, search }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?author=${search}`,
      );
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);
