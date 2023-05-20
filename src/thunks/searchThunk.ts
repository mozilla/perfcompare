/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type { Repository, Revision } from '../types/state';


interface FetchDataArgs {
  repository: Repository['name'];
  searchType: string;
}

interface FetchDataArgsIDEmail {
  repository: Repository['name'];
  search: string;
  searchType: string;
}

interface FetchDataMeta {
  error: string;
  searchType: string;
}

export const fetchRecentRevisions = createAsyncThunk<
  Revision[],
  FetchDataArgs,
  { rejectValue: FetchDataMeta }
>(
  'search/fetchRecentRevisions',
  async ({ repository, searchType }, { rejectWithValue }) => {
    let response;

    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
      );
    } catch (err) {
      const error = (err as Error).message;
      return rejectWithValue({ error, searchType });
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue({ error: 'No results found', searchType });
  },
);

export const fetchRevisionByID = createAsyncThunk<
  Revision[],
  FetchDataArgsIDEmail,
  { rejectValue: FetchDataMeta }
>(
  'search/fetchRevisionByID',
  async ({ repository, search, searchType }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?revision=${search}`,
      );
    } catch (err) {
      const error = (err as Error).message;
      return rejectWithValue({ error, searchType });
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue({ error: 'No results found', searchType });
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk<
  Revision[],
  FetchDataArgsIDEmail,
  { rejectValue: FetchDataMeta }
>(
  'search/fetchRevisionsByAuthor',
  async ({ repository, search, searchType }, { rejectWithValue }) => {
    let response;
    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repository}/push/?author=${search}`,
      );
    } catch (err) {
      const error = (err as Error).message;
      return rejectWithValue({ error, searchType });
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue({ error: 'No results found', searchType });
  },
);

