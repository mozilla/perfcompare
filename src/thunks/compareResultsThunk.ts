import { createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import { CompareResultsItem, Repository } from '../types/state';
import { Framework } from '../types/types';

export const fetchCompareResults = createAsyncThunk<
  CompareResultsItem[],
  {
    baseRepo: Repository['name'];
    baseRev: string;
    newRepo: Repository['name'];
    newRev: string;
    frameworkID: Framework['id'];
  },
  { rejectValue: string }
>(
  'compareResults/fetchCompareResults',
  async (
    { baseRepo, baseRev, newRepo, newRev, frameworkID = 1 },
    { rejectWithValue },
  ) => {
    let response;
    try {
      // TODO: currently this only fetches results for the talos framework
      // Once we have a dropdown to select test framework, remove the
      // hard-coded framework parameter
      response = await fetch(
        `${treeherderBaseURL}/api/perfcompare/results/?base_repository=${baseRepo}&base_revision=${baseRev}&new_repository=${newRepo}&new_revision=${newRev}&framework=${frameworkID}&interval=86400&no_subtests=true`,
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
