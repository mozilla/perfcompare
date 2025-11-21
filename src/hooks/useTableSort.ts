import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import { CombinedResultsItemType } from '../types/state';
import type {
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  SortFunc,
} from '../types/types';

// This hook handles the state that handles table sorting, and also takes care
// of handling the URL parameters that mirror this state.
//
// In the URL:
// * no column indication means the default (that is there is no sort)
// * otherwise, a single sort parameter contains both the column and the
// direction, separated by a character |.

const useTableSort = (
  columnsConfiguration:
    | CompareResultsTableConfig
    | CompareMannWhitneyResultsTableConfig,
) => {
  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const sortFromUrl = rawSearchParams.get('sort') ?? '';
  const [columnId, direction] = useMemo(() => {
    const [columnId, direction] = sortFromUrl.split('|');
    if (!columnId) {
      return [null, null];
    }

    const columnConfiguration = columnsConfiguration.find(
      (column) => column.key === columnId,
    );
    if (!columnConfiguration) {
      console.warn(`The column ${columnId} is unknown, reseting the sort.`);
      return [null, null];
    }

    if (direction !== 'asc' && direction !== 'desc') {
      return [columnId, 'desc'];
    }

    return [columnId, direction];
  }, [sortFromUrl, columnsConfiguration]);

  const [sortDirection, setSortDirection] = useState(
    direction as 'asc' | 'desc' | null,
  );
  const [sortColumn, setSortColumn] = useState(columnId);

  const onToggleSort = (
    columnId: string,
    newSortDirection: 'asc' | 'desc' | null,
  ) => {
    if (newSortDirection === null) {
      setSortColumn(null);
      setSortDirection(null);
      rawSearchParams.delete('sort');
    } else {
      setSortColumn(columnId);
      setSortDirection(newSortDirection);
      rawSearchParams.set('sort', columnId + '|' + newSortDirection);
    }
    updateRawSearchParams(rawSearchParams);
  };

  return { sortDirection, sortColumn, onToggleSort };
};

export default useTableSort;

// This function sorts the results array in accordance to the specified column
// and direction. If no column is specified, the first column (the subtests)
// is used.
export function sortResults(
  columnsConfiguration:
    | CompareResultsTableConfig
    | CompareMannWhitneyResultsTableConfig,
  results: CombinedResultsItemType[],
  columnId: string | null,
  direction: 'asc' | 'desc' | null,
  defaultSortFunction: (
    resultA: CombinedResultsItemType,
    resultB: CombinedResultsItemType,
  ) => number,
) {
  let sortFunction = defaultSortFunction;

  let columnConfiguration:
    | CompareResultsTableConfig[number]
    | CompareMannWhitneyResultsTableConfig[number]
    | undefined;
  if (columnId && direction) {
    columnConfiguration = columnsConfiguration.find(
      (column) => column.key === columnId,
    );
  }

  if (columnConfiguration) {
    if (!('sortFunction' in columnConfiguration)) {
      console.warn(
        `No sortFunction information for the columnConfiguration ${String(
          columnConfiguration.name ?? columnId,
        )}`,
      );
      return results;
    }

    sortFunction = columnConfiguration.sortFunction as SortFunc;
  }

  const directionedSortFunction =
    direction === 'desc'
      ? (itemA: CombinedResultsItemType, itemB: CombinedResultsItemType) =>
          sortFunction(itemB, itemA)
      : sortFunction;

  return results.toSorted(directionedSortFunction);
}
