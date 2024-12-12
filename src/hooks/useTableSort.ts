import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type { CompareResultsTableConfig } from '../types/types';

// This hook handles the state that handles table sorting, and also takes care
// of handling the URL parameters that mirror this state.
//
// In the URL:
// * no column indication means the default (that is there is no sort)
// * otherwise, a single sort parameter contains both the column and the
// direction, separated by a character |.

const useTableSort = (cellsConfiguration: CompareResultsTableConfig) => {
  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const sortFromUrl = rawSearchParams.get('sort') ?? '';
  const [columnId, direction] = useMemo(() => {
    const [columnId, direction] = sortFromUrl.split('|');
    if (!columnId) {
      return [null, null];
    }

    const cellConfiguration = cellsConfiguration.find(
      (column) => column.key === columnId,
    );
    if (!cellConfiguration) {
      console.warn(`The column ${columnId} is unknown, reseting the sort.`);
      return [null, null];
    }

    if (direction !== 'asc' && direction !== 'desc') {
      return [columnId, 'asc'];
    }

    return [columnId, direction];
  }, [sortFromUrl, cellsConfiguration]);

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
