import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { treeherderBaseURL } from '../common/constants';
import type {
  CompareResultsState,
  CompareResultsItem,
  Repository,
  ResultsHashmap,
} from '../types/state';
import type { FakeCommitHash } from '../types/types';

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

export const fetchFakeResults = createAsyncThunk<
  CompareResultsItem[],
  FakeCommitHash,
  { rejectValue: string }
>(
  'compareResults/fetchFakeResults',
  async (commitHash, { rejectWithValue }) => {
    try {
      const module = (await import(`../mockData/${commitHash}`)) as {
        comparisonResults: CompareResultsItem[];
      };
      return module.comparisonResults;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

const initialState: CompareResultsState = {
  data: {} as ResultsHashmap,
  loading: false,
  error: undefined,
};

function fetchPending(state: CompareResultsState) {
  state.loading = true;
  state.error = initialState.error;
}

function fetchFulfilled(
  state: CompareResultsState,
  action: PayloadAction<CompareResultsItem[]>,
) {
  const revisionHash = action.payload[0].new_rev;
  state.data[revisionHash] = action.payload;
  state.loading = initialState.loading;
}

function fetchRejected(
  state: CompareResultsState,
  action: PayloadAction<string | undefined>,
) {
  state.error = action.payload;
  state.loading = initialState.loading;
}

const compareResults = createSlice({
  name: 'compareResults',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompareResults.pending, fetchPending)
      .addCase(fetchFakeResults.pending, fetchPending)
      .addCase(fetchCompareResults.fulfilled, fetchFulfilled)
      .addCase(fetchFakeResults.fulfilled, fetchFulfilled)
      .addCase(fetchCompareResults.rejected, fetchRejected)
      .addCase(fetchFakeResults.rejected, fetchRejected);
  },
});

export default compareResults.reducer;
