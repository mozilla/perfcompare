import { useState } from 'react';

// This hook handles the state that handles table sorting, and also takes care
// of handling the URL parameters that mirror this state.
//
// In the URL:
// * no column indication means the default (that is there is no sort)
// * otherwise, a single sort parameter contains both the column and the
// direction, separated by a character |.

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
