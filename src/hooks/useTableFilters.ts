import { useState } from 'react';

const useTableFilters = () => {
  const [tableFilters, setTableFilters] = useState(
    new Map() as Map<string, Set<string>>, // ColumnID -> Set<Values to remove>
  );

  const onClearFilter = (columnId: string) => {
    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.delete(columnId);
      return newFilters;
    });
  };

  const onToggleFilter = (columnId: string, filters: Set<string>) => {
    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.set(columnId, filters);
      return newFilters;
    });
  };

  return { tableFilters, onClearFilter, onToggleFilter };
};

export default useTableFilters;
