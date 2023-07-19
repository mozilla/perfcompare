import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import { CompareResultsItem, Repository } from '../types/state';

export const fetchCompareResults = createAsyncThunk<
  CompareResultsItem[],
  {
    baseRepo: Repository['name'];
    baseRev: string;
    newRepo: Repository['name'];
    newRev: string;
  },
  { rejectValue: string }
>(
  'compareResults/fetchCompareResults',
  async ({ baseRepo, baseRev, newRepo, newRev }, { rejectWithValue }) => {
    let response;
    try {
      //Note: We can now select and add the framework in the url
      response = await fetch(
        `${treeherderBaseURL}/api/perfcompare/results/?base_repository=${baseRepo}&base_revision=${baseRev}&new_repository=${newRepo}&new_revision=${newRev}&framework=1&interval=86400&no_subtests=true`,
      );
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
    const json = (await response.json()) as CompareResultsItem[];
    if (json.length > 0) {
      return json;
    }
    return rejectWithValue('No results found');
  },
);
