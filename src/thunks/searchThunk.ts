/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type { Repository, RevisionsList, InputType } from '../types/state';

interface FetchDataArgs {
  repository: Repository['name'];
  searchType: InputType;
}

interface FetchDataArgsIDEmail {
  repository: Repository['name'];
  search: string;
  searchType: InputType;
}

interface FetchDataMeta {
  error: string;
  searchType: InputType;
}

export const fetchRecentRevisions = createAsyncThunk<
  RevisionsList[],
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
  RevisionsList[],
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
  RevisionsList[],
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

