/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type { APIPushResponse } from '../types/api';
import type { Repository, RevisionsList, InputType } from '../types/state';

interface FetchDataArgs {
  repository: number;
  searchType: InputType;
}

export const fetchRecentRevisions = createAsyncThunk<
  RevisionsList[],
  FetchDataArgs,
  { rejectValue: string }
>(
  'search/fetchRecentRevisions',
  async ({ repository, searchType }, { rejectWithValue }) => {
    let response;

    try {
      response = await fetch(`${treeherderBaseURL}/api/perfcompare/results/?`);
    } catch (err) {
      const error = (err as Error).message;
      return rejectWithValue(error);
    }
    const json = (await response.json()) as APIPushResponse;
    if (json.results.length > 0) {
      return json.results;
    }
    return rejectWithValue('No results found');
  },
);
