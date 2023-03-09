import { useDispatch } from 'react-redux';
import { RootState } from '../common/store';

import {
  addFilter,
  removeFilter,
  setFilteredResults,
  resetFilters,
} from '../reducers/FilterCompareResultsSlice';
import { CompareResultsItem } from '../types/state';
import { ActiveFilters, FilteredResults, FilterValue } from '../types/types';
import { useAppSelector } from './app';

const useFilterCompareResults = () => {
  const dispatch = useDispatch();
  const activeFilters: ActiveFilters = useAppSelector(
    (state: RootState) => state.filterCompareResults.activeFilters,
  );

  const compareResults: CompareResultsItem[] = useAppSelector(
    (state: RootState) => state.compareResults.data,
  );

  const setFilters = (value: string, checked: boolean, name: string) => {
    const filter: FilterValue = { name, value };
    if (checked) {
      dispatch(addFilter(filter));
    } else {
      dispatch(removeFilter(filter));
    }
  };

  const filterResults = () => {
    const selectedFilters = Object.keys(activeFilters).filter(
      (key) => activeFilters[key as keyof typeof activeFilters].length,
    );
    const { platform, test, confidence } = activeFilters;
    const isFiltered = !!(platform.length || test.length || confidence.length);

    const data = compareResults.filter((result: CompareResultsItem) => {
      const isValid = true;
      const validResult = selectedFilters.reduce(
        (previousValue, currentValue) => {
          const currentOptions =
            activeFilters[currentValue as keyof typeof activeFilters];
          const resultField = (
            currentValue === 'confidence' ? 'confidence_text' : currentValue
          ) as keyof typeof result;
          const fieldValue = result[resultField] as string;

          if (currentOptions.includes('not available') && !fieldValue) {
            return previousValue && true;
          }

          return previousValue && currentOptions.includes(fieldValue);
        },
        isValid,
      );
      return validResult;
    });

    const filteredResults: FilteredResults = {
      data,
      activeFilters,
      isFiltered,
    };

    dispatch(setFilteredResults(filteredResults));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  return { setFilters, filterResults, clearFilters };
};

export default useFilterCompareResults;
