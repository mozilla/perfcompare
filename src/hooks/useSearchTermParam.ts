import { useState } from 'react';

import useRawSearchParams from './useRawSearchParams';
import { currentUrlParams } from '../utils/tableStatePersistence';

// The table search term, mirrored in the "search" URL param without a rerender.
// Writes build from the live URL so params written out-of-band after mount
// (e.g. the `initialized` marker) aren't clobbered.
const useSearchTermParam = () => {
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialSearchTerm = rawSearchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const onSearchTermChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    const params = currentUrlParams();
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    updateRawSearchParams(params);
  };

  return { initialSearchTerm, searchTerm, onSearchTermChange };
};

export default useSearchTermParam;
