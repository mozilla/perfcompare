import { useDispatch } from 'react-redux';

import {
  addFilter,
  applyFilters,
  removeFilter,
} from '../reducers/FilterCompareResultsSlice';
import { ActiveFilters, FilterValue } from '../types/types';
import { useAppSelector } from './app';

const useFilterCompareResults = () => {
  const dispatch = useDispatch();
  const activeFilters : ActiveFilters = useAppSelector(
    (state) => state.filterCompareResults.activeFilters,
  );

  const setFilters = (
    value: string,
    checked: boolean,
    name: string,
  ) => {
    const filter: FilterValue = { name, value };    

    if (checked) {
      dispatch(addFilter(filter));
    } else {
      dispatch(removeFilter(filter));
    }
  };

  const filterResults = () => {
    dispatch(applyFilters(activeFilters));
  };

  return { setFilters, filterResults };
};

export default useFilterCompareResults;
