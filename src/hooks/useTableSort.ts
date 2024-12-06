import { useState } from 'react';

// This hook handles the state that handles table sorting.
const useTableSort = () => {
  const [sortDirection, setSortDirection] = useState(
    null as 'asc' | 'desc' | null,
  );
  const [sortColumn, setSortColumn] = useState(null as string | null);

  const onToggleSort = (
    columnId: string,
    newSortDirection: 'asc' | 'desc' | null,
  ) => {
    if (newSortDirection === null) {
      setSortColumn(null);
      setSortDirection(null);
    } else {
      setSortColumn(columnId);
      setSortDirection(newSortDirection);
    }
  };

  return { sortDirection, sortColumn, onToggleSort };
};

export default useTableSort;
