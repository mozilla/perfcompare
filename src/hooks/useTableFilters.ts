import { useMemo, useState } from 'react';

import useRawSearchParams from './useRawSearchParams';

const useTableFilters = () => {
  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const [tableFilters, setTableFilters] = useState(
    new Map() as Map<string, Set<string>>, // ColumnID -> Set<Values to remove>
  );

  useMemo(() => {
    const filters = Array.from(rawSearchParams.entries())
      .filter(([key]) => key.startsWith('filter'))
      .reduce((accumulator: Map<string, Set<string>>, [key, value]) => {
        const columnId = key.split('_')[1];
        if (!accumulator.has(columnId)) {
          accumulator.set(columnId, new Set());
        }
        const valuesArray = value.split(',').map((item) => item.trim());
        valuesArray.forEach((item) => accumulator.get(columnId)?.add(item));
        return accumulator;
      }, new Map<string, Set<string>>());

    setTableFilters(filters);
  }, [rawSearchParams]);

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
