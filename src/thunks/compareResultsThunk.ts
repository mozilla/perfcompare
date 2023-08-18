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
    framework: string; // expected values are the framework's ids (frameworks examples talos, awsy, mozperftest, browsertime, build_metrics)
  },
  { rejectValue: string }
>(
  'compareResults/fetchCompareResults',
  async (
    { baseRepo, baseRev, newRepo, newRev, framework },
    { rejectWithValue },
  ) => {
    let response;
    try {
      //Note: We can now select and add the framework in the url
      const searchParams = new URLSearchParams({
        base_repository: baseRepo,
        base_revision: baseRev,
        new_repository: newRepo,
        new_revision: newRev,
        framework,
        interval: '86400',
        no_subtests: 'true',
      });
      response = await fetch(
        `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`,
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
