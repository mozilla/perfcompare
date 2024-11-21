import { useState, useMemo } from 'react';

import type {
  CompareResultsTableConfig,
  CompareResultsTableCell,
} from '../types/types';
import useRawSearchParams from './useRawSearchParams';

const useTableFilters = (cellsConfiguration: CompareResultsTableConfig) => {
  const columnIdToConfiguration: Map<string, CompareResultsTableCell> = useMemo(
    () => new Map(cellsConfiguration.map((val) => [val.key, val])),
    [cellsConfiguration],
  );

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  // This function collects the table filters from the search params. It will
  // only be called once at mount time.
  const getInitialTableFilters = () => {
    const result: Map<string, Set<string>> = new Map();
    for (const [param, paramValue] of rawSearchParams.entries()) {
      if (!param.startsWith('filter_')) {
        continue;
      }

      const columnId = param.slice('filter_'.length);
      const cellConfiguration = columnIdToConfiguration.get(columnId);
      if (!cellConfiguration || !cellConfiguration.filter) {
        // The columnId passed as a parameter doesn't exist or isn't a
        // filterable column, ignore it.
        continue;
      }

      const configuredValues = paramValue.split(',').map((item) => item.trim());

      result.set(columnId, new Set(configuredValues));
    }

    return result;
  };

  const [tableFilters, setTableFilters] = useState(getInitialTableFilters);

  const onClearFilter = (columnId: string) => {
    rawSearchParams.delete(`filter_${columnId}`);
    updateRawSearchParams(rawSearchParams);

    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.delete(columnId);
      return newFilters;
    });
  };

  const onToggleFilter = (columnId: string, filters: Set<string>) => {
    if (filters.size > 0) {
      rawSearchParams.set(`filter_${columnId}`, Array.from(filters).join(','));
    } else {
      rawSearchParams.delete(`filter_${columnId}`);
    }
    updateRawSearchParams(rawSearchParams);

    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.set(columnId, filters);
      return newFilters;
    });
  };

  return { tableFilters, onClearFilter, onToggleFilter };
};

export default useTableFilters;
