import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { comparisonResults } from '../common/mockResultsData';
import type { CompareResultsItem } from '../types/state';
import { ActiveFilters, FilterValue } from '../types/types';

interface Filter {
  comparisonResults: CompareResultsItem[];
  filteredResults: CompareResultsItem[];
  activeFilters: ActiveFilters;
}

const initialState: Filter = {
  comparisonResults,
  filteredResults: [],
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
        activeFilters: {
          ...state.activeFilters,
          [filter]: [...state.activeFilters[filter], value],
        },
      };
    },
    removeFilter(state: Filter, action: PayloadAction<FilterValue>) {
      const { name, value } = action.payload;
      const filter = name as keyof typeof initialState.activeFilters;

      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [filter]: state.activeFilters[filter].filter(
            (option) => option !== value,
          ),
        },
      };
    },
    applyFilters(state: Filter, action: PayloadAction<ActiveFilters>) {
      const activeFilters: ActiveFilters = action.payload;
      const selectedFilters = Object.keys(action.payload).filter(
        (key) => activeFilters[key as keyof typeof activeFilters].length,
      );

      const filteredResults = state.comparisonResults.filter(
        (result: CompareResultsItem) => {
          const isValid = true;
          const validResult = selectedFilters.reduce(
            (previousValue, currentValue) => {
              const resultField =
                currentValue === 'confidence'
                  ? 'confidence_text'
                  : currentValue;

              return (
                previousValue &&
                activeFilters[
                  currentValue as keyof typeof activeFilters
                ].includes(result[resultField as keyof typeof result] as string)
              );
            },
            isValid,
          );
          return validResult;
        },
      );

      return {
        ...state,
        filteredResults,
      };
    },
  },
});

export const { addFilter, removeFilter, applyFilters } =
  filterCompareResults.actions;

export default filterCompareResults.reducer;
