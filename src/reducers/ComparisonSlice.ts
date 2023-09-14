import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../common/store';
import { Strings } from '../resources/Strings';
import { CompareResultsItem, RevisionsHeader } from '../types/state';
import { truncateHash } from '../utils/helpers';

interface InitialState {
  activeComparison: string;
}

const initialState: InitialState = {
  activeComparison: 'All revisions',
};

type Results = {
  key: string;
  value: CompareResultsItem[];
  revisionHeader: RevisionsHeader;
};

type ResultsGroupedByKey = Record<string, ResultObject[]>;

interface ResultObject {
  header_name: string;
  new_rev: string;
}

const comparison = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    updateComparison(
      state,
      action: PayloadAction<{
        activeComparison: string;
      }>,
    ) {
      state.activeComparison = action.payload.activeComparison;
    },
  },
});

/*This function transforms results into an array of objects, where each object represents a array of objects 
grouped by their header_name as key. The keys in the resulting objects are composed of header_name and a 
truncated hash of new_rev.
for example: [
  {
    "a11yr opt e10s fission stylo webrender 69d5beb77da0": [
      {
        "base_rev": "8f5a11c1eb0b7598d1415f6efa9c360191a423f8",
        "new_rev": "69d5beb77da06f9eda78eff3c54463273d457e66",
        "framework_id": 1,...}{}{}...]}{}{}...] */
export const formatDownloadData = (
  data: Record<string, ResultObject[]>,
): Array<ResultsGroupedByKey> => {
  const groupNames = Object.keys(data);
  const transformedGroups: Array<ResultsGroupedByKey> = [];

  groupNames.forEach((groupName) => {
    const groupedResults = data[groupName].reduce(
      (grouped: ResultsGroupedByKey, result: ResultObject) => {
        if (!grouped[result.header_name]) {
          grouped[result.header_name] = [];
        }
        grouped[result.header_name].push(result);
        return grouped;
      },
      {},
    );

    const transformedGroupEntries = Object.keys(groupedResults).map(
      (header_name) => {
        const key = `${header_name} ${truncateHash(
          groupedResults[header_name][0].new_rev,
        )}`;
        const value = groupedResults[header_name];

        return {
          [key]: value,
        };
      },
    );

    transformedGroups.push(...transformedGroupEntries);
  });
  return transformedGroups;
};

export const selectStringifiedJsonResults = createSelector(
  (state: RootState) => state.comparison.activeComparison,
  (state: RootState) => state.compareResults.data,
  (activeComparison, data) => {
    if (
      activeComparison ===
      Strings.components.comparisonRevisionDropdown.allRevisions
    ) {
      return JSON.stringify(formatDownloadData(data), null, 2);
    } else {
      return JSON.stringify(
        formatDownloadData({
          [activeComparison]: data[activeComparison],
        }),
        null,
        2,
      );
    }
  },
);

function processResults(results: CompareResultsItem[]) {
  const processedResults: Map<string, CompareResultsItem[]> = new Map<
    string,
    CompareResultsItem[]
  >();
  results.forEach((result) => {
    const { new_rev: newRevision, header_name: header } = result;
    const rowIdentifier = header.concat(' ', newRevision);
    if (processedResults.has(rowIdentifier)) {
      (processedResults.get(rowIdentifier) as CompareResultsItem[]).push(
        result,
      );
    } else {
      processedResults.set(rowIdentifier, [result]);
    }
  });
  const restructuredResults: Results[] = Array.from(
    processedResults,
    function ([rowIdentifier, result]) {
      return {
        key: rowIdentifier,
        value: result,
        revisionHeader: {
          suite: result[0].suite,
          framework_id: result[0].framework_id,
          test: result[0].test,
          option_name: result[0].option_name,
          extra_options: result[0].extra_options,
          new_rev: result[0].new_rev,
          new_repo: result[0].new_repository_name,
        },
      };
    },
  );

  return restructuredResults;
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions;

export const selectProcessedResults = createSelector(
  (state: RootState) => state.compareResults.data,
  (state: RootState) => state.comparison.activeComparison,
  (data, activeComparison) => {
    if (activeComparison === allRevisionsOption) {
      const allResults = ([] as CompareResultsItem[]).concat(
        ...Object.values(data),
      );
      return processResults(allResults);
    } else {
      const results = data[activeComparison];
      return processResults(results);
    }
  },
);

export const selectNewRevisions = createSelector(
  (state: RootState) => state.selectedRevisions.new,
  (newSelectedRevisions) => {
    return newSelectedRevisions.map((item) => item.revision);
  },
);

export const { updateComparison } = comparison.actions;

export default comparison.reducer;
