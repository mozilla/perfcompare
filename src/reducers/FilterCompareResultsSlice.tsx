import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { CompareResultsItem } from '../types/state';
import { FilterValue, ActiveFilters, FilteredResults } from '../types/types';

interface Filter {
  compareResults: [];
  filteredResults: CompareResultsItem[];
  updatedOptions: boolean;
  isFiltered: boolean;
  activeFilters: ActiveFilters;
}

const initialState: Filter = {
  filteredResults: [],
  compareResults: [],
  updatedOptions: false,
  isFiltered: false,
  activeFilters: {
    platform: [],
    test: [],
    confidence: [],
  },
};

export const filterCompareResults = createSlice({
  name: 'filterCompareResults',
  initialState,
  reducers: {
    addFilter(state: Filter, action: PayloadAction<FilterValue>) {
      const { name, value } = action.payload;
      const filter = name as keyof typeof initialState.activeFilters;

      return {
        ...state,
        updatedOptions: true,
        activeFilters: {
          ...state.activeFilters,
          [filter]: [...state.activeFilters[filter], value],
        },
      };
    },
    removeFilter(state: Filter, action: PayloadAction<FilterValue>) {
      const { name, value } = action.payload;
      const filter = name as keyof typeof initialState.activeFilters;
      const newValues: string[] = state.activeFilters[filter].filter(
        (option: string) => option !== value,
      );

      return {
        ...state,
        updatedOptions: true,
        activeFilters: {
          ...state.activeFilters,
          [filter]: newValues,
        },
      };
    },
    setFilteredResults(state: Filter, action: PayloadAction<FilteredResults>) {
      const { data, isFiltered } = action.payload;

      return {
        ...state,
        updatedOptions: false,
        filteredResults: data,
        isFiltered,
      };
    },
    resetFilters() {
      return {
        ...initialState,
      };
    },
  },
});

export const { addFilter, removeFilter, setFilteredResults, resetFilters } =
  filterCompareResults.actions;

export default filterCompareResults.reducer;
