import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type {
  CompareResultsTableConfig,
  CompareResultsTableCell,
} from '../types/types';

// This hook handles the state that handles table filtering, and also takes care
// of handling the URL parameters that mirror this state.
// Currently the state contains the _unselected_ items (the default is that
// they're all selected), while the URL contains the _selected_ items because it
// makes more sense to the user.
//
// In the URL:
// * no column indication means the default (that is all values are selected)
// * a column indication with comma-delimited values will select these values
//   (therefore the values not specified here will be added to the state).
// * a column indication with an empty value will unselect everything (all
//   possible values will be added to the state).
//
// For example:
// * no "filter_confidence" means all values for confidence are shown.
// * "filter_confidence=medium,high" means that "none" and "low" will be added
//   to the state, and the lines with confidence values "medium" and "high" are
//   displayed.
// * "filter_confidence=" means that no line will be displayed, which isn't
//   super useful actually (but is supported).
//
// In the future we'd like the state to contains the selected items instead.

const useTableFilters = (cellsConfiguration: CompareResultsTableConfig) => {
  const columnIdToConfiguration: Map<string, CompareResultsTableCell> = useMemo(
    () => new Map(cellsConfiguration.map((val) => [val.key, val])),
    [cellsConfiguration],
  );

  const filterValuesBySet = (
    values: Array<{ key: string }>,
    excludedKeys: Set<string>,
  ) => {
    // Note: in the future it would be more idiomatic to use Set.difference,
    // but it's not widely available enough at the time of writing this.
    return values
      .filter(({ key }) => !excludedKeys.has(key))
      .map(({ key }) => key);
  };

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  // This function collects the table filters from the search params. It will
  // only be called once at mount time.
  const getInitialTableFilters = () => {
    const result: Map<string, Set<string>> = new Map();
    for (const [param, paramValue] of rawSearchParams.entries()) {
      if (!param.startsWith('filter_')) {
        continue;
      }

      const columnId = param.slice('filter_'.length);
      const cellConfiguration = columnIdToConfiguration.get(columnId);
      if (!cellConfiguration || !cellConfiguration.filter) {
        // The columnId passed as a parameter doesn't exist or isn't a
        // filterable column, ignore it.
        continue;
      }

      const configuredValuesSet = new Set(
        paramValue.split(',').map((item) => item.trim()),
      );
      // Now we need to compute which possible values are _not_ specified in the
      // URL, that is we compute the difference. Remember that the state holds
      // the unchecked values (currently).
      const uncheckedValueKeys = filterValuesBySet(
        cellConfiguration.possibleValues,
        configuredValuesSet,
      );

      result.set(columnId, new Set(uncheckedValueKeys));
    }

    return result;
  };

  const [tableFilters, setTableFilters] = useState(getInitialTableFilters);

  const onClearFilter = (columnId: string) => {
    rawSearchParams.delete(`filter_${columnId}`);
    updateRawSearchParams(rawSearchParams);

    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.delete(columnId);
      return newFilters;
    });
  };

  const onToggleFilter = (columnId: string, filters: Set<string>) => {
    const cellConfiguration = columnIdToConfiguration.get(columnId);
    if (!cellConfiguration || !cellConfiguration.filter) {
      // The columnId passed as a parameter doesn't exist or isn't a
      // filterable column, ignore it.
      console.error(
        "The user toggled a filter that's not available in the cellConfiguration, it's likely a bug.",
      );
      return;
    }

    if (filters.size > 0) {
      // We need to compute which values are not stored in the state. They are
      // the values that should be present in the URL.
      const checkedValueKeys = filterValuesBySet(
        cellConfiguration.possibleValues,
        filters,
      );

      rawSearchParams.set(`filter_${columnId}`, checkedValueKeys.join(','));
    } else {
      rawSearchParams.delete(`filter_${columnId}`);
    }
    updateRawSearchParams(rawSearchParams);

    setTableFilters((oldFilters) => {
      const newFilters = new Map(oldFilters);
      newFilters.set(columnId, filters);
      return newFilters;
    });
  };

  return { tableFilters, onClearFilter, onToggleFilter };
};

export default useTableFilters;
