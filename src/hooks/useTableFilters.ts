import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type { CompareResultsItem } from '../types/state';
import type {
  CompareResultsTableConfig,
  CompareResultsTableColumn,
} from '../types/types';

// This hook handles the state that handles table filtering, and also takes care
// of handling the URL parameters that mirror this state.
// Both the state and the URL contain the _selected_ items.
//
// In the URL:
// * no column indication means the default (that is all values are selected)
// * a column indication with comma-delimited values will select these values
//   (therefore the values not specified here will be added to the state).
// * a column indication with an empty value will unselect everything (all
//   possible values will be added to the state).
//
// In the state, when all items are checked for a column, there may or may not
// be an entry in the state for that column. This means that if there's no entry
// for a filterable column, it means all values are checked.
//
// For example:
// * no "filter_confidence" means all values for confidence are shown.
// * "filter_confidence=medium,high" means that "none" and "low" will be added
//   to the state, and the lines with confidence values "medium" and "high" are
//   displayed.
// * "filter_confidence=" means that no line will be displayed, which isn't
//   super useful actually (but is supported).

const useTableFilters = (columnsConfiguration: CompareResultsTableConfig) => {
  const columnIdToConfiguration: Map<string, CompareResultsTableColumn> =
    useMemo(
      () => new Map(columnsConfiguration.map((val) => [val.key, val])),
      [columnsConfiguration],
    );

  const keepValuesBySet = (
    values: Array<{ key: string }>,
    includedKeys: Set<string>,
  ) => {
    // Note: in the future it could be more idiomatic to use one of the Set
    // methods but it's not widely available enough at the time of writing this.
    return values
      .filter(({ key }) => includedKeys.has(key))
      .map(({ key }) => key);
  };

  // This is our custom hook that updates the search params without a rerender.
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  // This function collects the table filters from the search params. It will
  // only be called once at mount time.
  const getInitialTableFilters = () => {
    const result: Map<string, Set<string>> = new Map();
    for (const columnConfiguration of columnsConfiguration) {
      if (!('filter' in columnConfiguration)) {
        continue;
      }

      const { key: columnKey, possibleValues } = columnConfiguration;

      const paramValue = rawSearchParams.get('filter_' + columnKey);
      if (paramValue) {
        const configuredValuesSet = new Set(
          paramValue.split(',').map((item) => item.trim()),
        );

        // Now we need to make sure all specified values are correct. Let's keep
        // only the possible values.
        const checkedValueKeys = keepValuesBySet(
          possibleValues,
          configuredValuesSet,
        );

        result.set(columnKey, new Set(checkedValueKeys));
      } else {
        result.set(columnKey, new Set(possibleValues.map(({ key }) => key)));
      }
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
    const columnConfiguration = columnIdToConfiguration.get(columnId);
    if (!columnConfiguration || !('filter' in columnConfiguration)) {
      // The columnId passed as a parameter doesn't exist or isn't a
      // filterable column, ignore it.
      console.error(
        "The user toggled a filter that's not available in the columnConfiguration, it's likely a bug.",
      );
      return;
    }

    if (filters.size < columnConfiguration.possibleValues.length) {
      rawSearchParams.set(`filter_${columnId}`, [...filters].join(','));
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

/* --- Functions used to implement the filtering --- */
function resultMatchesColumnFilter(
  columnsConfiguration: CompareResultsTableConfig,
  result: CompareResultsItem,
  columnId: string,
  checkedValues: Set<string>,
): boolean {
  const columnConfiguration = columnsConfiguration.find(
    (column) => column.key === columnId,
  );
  if (!columnConfiguration || !('filter' in columnConfiguration)) {
    return true;
  }

  if (checkedValues.size === columnConfiguration.possibleValues.length) {
    // Return all values if all the checkboxes are set. This makes it possible
    // to return values that are different.
    return true;
  }

  for (const filterValueKey of checkedValues) {
    if (columnConfiguration.matchesFunction(result, filterValueKey)) {
      return true;
    }
  }
  return false;
}

// This function filters the results array using both the searchTerm and the
// tableFilters. The tableFilters is a map ColumnID -> Set of values to add.
//
// Note that the argument searchTerm can be made of several terms separated with space
// characters, this works as a AND operation.
// This also supports negative filtering if one of the search terms starts with
// a "-" character.
export function filterResults(
  columnsConfiguration: CompareResultsTableConfig,
  results: CompareResultsItem[],
  searchTerm: string,
  tableFilters: Map<string, Set<string>>,
  resultMatchesSearchTerm: (
    result: CompareResultsItem,
    searchTerm: string,
  ) => boolean,
) {
  if (!searchTerm && !tableFilters.size) {
    return results;
  }

  // Using the regexp instead of a simple space supports all white-space as well
  // as when several space characters are present. For example for "foo   bar"
  // we'll get just 2 items in the resulting array with the regexp, which is a
  // better behavior.
  const searchTerms = searchTerm.toLowerCase().split(/\s+/);

  return results.filter((result) => {
    for (const searchTerm of searchTerms) {
      if (searchTerm.startsWith('-')) {
        if (searchTerm.length > 1) {
          const negativeSearchTerm = searchTerm.slice(1);
          if (resultMatchesSearchTerm(result, negativeSearchTerm)) {
            return false;
          }
        }
      } else if (!resultMatchesSearchTerm(result, searchTerm)) {
        return false;
      }
    }

    for (const [columnId, checkedValues] of tableFilters) {
      if (
        !resultMatchesColumnFilter(
          columnsConfiguration,
          result,
          columnId,
          checkedValues,
        )
      ) {
        return false;
      }
    }

    return true;
  });
}
