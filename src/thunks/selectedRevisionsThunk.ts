import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type { Revision } from '../types/state';

export const fetchSelectedRevisions = createAsyncThunk<
  Revision,
  { repo: string; rev: string },
  { rejectValue: string }
>(
  'selectedRevisions/fetchSelectedRevisions',
  async ({ repo, rev }, { rejectWithValue }) => {
    let response;

    try {
      response = await fetch(
        `${treeherderBaseURL}/api/project/${repo}/push/?revision=${rev}`,
      );
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      // console.log(json.results);
      return json.results[0];
    }

    return rejectWithValue('No results found');
  },
);
