import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { Repository, Revision } from '../types/state';

export const fetchRecentRevisions = createAsyncThunk<
  Revision[],
  Repository['name'],
  { rejectValue: string }
>('search/fetchRecentRevisions', async (repository, { rejectWithValue }) => {
  let response;
  try {
    response = await fetch(
      `${treeherderBaseURL}/api/project/${repository}/push/`,
    );
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
  const json = await response.json();
  if (json.results.length > 0) {
    return json.results;
  }

  return rejectWithValue('No results found');
});

export const fetchRevisionByID = createAsyncThunk<
  Revision[],
  { repository: Repository['name']; search: string },
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
    const json = await response.json();
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);

export const fetchRevisionsByAuthor = createAsyncThunk<
  Revision[],
  { repository: Repository['name']; search: string },
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
    const json = await response.json();
    if (json.results.length > 0) {
      return json.results;
    }

    return rejectWithValue('No results found');
  },
);
