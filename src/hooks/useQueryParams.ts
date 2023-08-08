import React from 'react';

import { useLocation } from 'react-router-dom';

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

// How to use
// In the component function initialize the hook like so
// const query = useQuery();
// This is how you can retrive the value of the query param.
// const value = query.get('revision1');
