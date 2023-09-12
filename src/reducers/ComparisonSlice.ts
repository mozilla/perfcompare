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

interface GroupedResults {
  [key: string]: ResultObject[];
}

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

export const formatDownloadData = (
  data: Record<string, ResultObject[]>,
): object[] => {
  const groupNames = Object.keys(data);
  const transformedGroups: object[] = [];

  groupNames.forEach((groupName) => {
    const groupedResults = data[groupName].reduce(
      (grouped: GroupedResults, result: ResultObject) => {
        if (!grouped[result.header_name]) {
          grouped[result.header_name] = [];
        }
        grouped[result.header_name].push(result);
        return grouped;
      },
      {},
    );

    const transformedGroupEntries = Object.keys(groupedResults).map(
      (header_name) => ({
        [`${header_name} ${truncateHash(
          groupedResults[header_name][0].new_rev,
        )}`]: groupedResults[header_name],
      }),
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
      return JSON.stringify(formatDownloadData(data));
    } else {
      return JSON.stringify(
        formatDownloadData({
          [activeComparison]: data[activeComparison],
        }),
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
