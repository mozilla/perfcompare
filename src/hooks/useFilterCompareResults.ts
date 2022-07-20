import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../common/store';
import {
  addFilter,
  applyFilters,
  removeFilter,
} from '../reducers/FilterCompareResultsSlice';
import { FilterValue } from '../types/types';

const useFilterCompareResults = () => {
  const dispatch = useDispatch();
  const activeFilters = useSelector(
    (state: RootState) => state.filterCompareResults.activeFilters,
  );

  const setFilters = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
    name: string,
  ) => {
    const filter: FilterValue = { name, value: e.target.value };

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
