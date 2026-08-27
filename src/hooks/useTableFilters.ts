import { useState, useMemo } from 'react';

import useRawSearchParams from './useRawSearchParams';
import type {
  CombinedResultsItemType,
  CompareResultsItem,
} from '../types/state';
import type {
  CompareResultsTableConfig,
  CompareResultsTableColumn,
  CompareMannWhitneyResultsTableConfig,
  CompareMannWhitneyResultsTableColumn,
} from '../types/types';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import {
  filterParam,
  filterCookie,
  isTableStateInitialized,
  currentUrlParams,
} from '../utils/tableStatePersistence';

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

const useTableFilters = (
  columnsConfiguration:
    | CompareResultsTableConfig
    | CompareMannWhitneyResultsTableConfig,
) => {
  const columnIdToConfiguration: Map<
    string,
    CompareResultsTableColumn | CompareMannWhitneyResultsTableColumn
  > = useMemo(
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
  // Cookies are only consulted for an uninitialized URL; an initialized URL is
  // the single source of truth so a shared link reproduces the same view.
  const initialized = isTableStateInitialized(window.location.search);

  const getInitialTableFilters = () => {
    const result: Map<string, Set<string>> = new Map();
    for (const columnConfiguration of columnsConfiguration) {
      if (!('filter' in columnConfiguration)) {
        continue;
      }

      const { key: columnKey, possibleValues } = columnConfiguration;

      const paramValue =
        rawSearchParams.get(filterParam(columnKey)) ??
        (initialized ? null : getCookie(filterCookie(columnKey)));
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
    const params = currentUrlParams();
    params.delete(filterParam(columnId));
    updateRawSearchParams(params);
    deleteCookie(filterCookie(columnId));

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

    const params = currentUrlParams();
    if (filters.size < columnConfiguration.possibleValues.length) {
      params.set(filterParam(columnId), [...filters].join(','));
      setCookie(filterCookie(columnId), [...filters].join(','));
    } else {
      params.delete(filterParam(columnId));
      deleteCookie(filterCookie(columnId));
    }
    updateRawSearchParams(params);

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

// A column whose filter is actively hiding rows, with the human-readable labels
// of the values it excludes. Used to explain to the user which filters are
// hiding results (see FilteredRowsNotice).
export type ActiveColumnFilter = {
  name: string;
  excludedLabels: string[];
};

// Describe every column whose filter is narrowing the results — i.e. some of
// its possible values are unchecked. A column with all values checked (or no
// entry in the map) isn't narrowing anything and is skipped. Labels come from
// the column configuration so they always match what the header shows.
function getActiveColumnFilters(
  columnsConfiguration: CompareResultsTableConfig,
  tableFilters: Map<string, Set<string>>,
): ActiveColumnFilter[] {
  const active: ActiveColumnFilter[] = [];
  for (const column of columnsConfiguration) {
    if (!('filter' in column)) {
      continue;
    }
    const checkedValues = tableFilters.get(column.key);
    if (!checkedValues || checkedValues.size >= column.possibleValues.length) {
      continue;
    }
    const excludedLabels = column.possibleValues
      .filter(({ key }) => !checkedValues.has(key))
      .map(({ label }) => label);
    if (excludedLabels.length) {
      active.push({ name: column.name, excludedLabels });
    }
  }
  return active;
}

// Stable empty filter map used to compute the "search only" result set, so we
// can tell how many rows the column filters (as opposed to the search term) are
// hiding.
const NO_FILTERS: Map<string, Set<string>> = new Map();

// Summarize what the active column filters are hiding, for FilteredRowsNotice:
// the active filters (with their excluded value labels) and how many rows they
// remove — counting only rows the column filters drop, not ones the search term
// already removed. `filteredCount` is the length of the already-computed
// search+filter result, passed in so we don't filter that set a second time.
export function getFilterHiddenSummary(
  columnsConfiguration: CompareResultsTableConfig,
  results: CombinedResultsItemType[],
  searchTerm: string,
  tableFilters: Map<string, Set<string>>,
  resultMatchesSearchTerm: (
    result: CombinedResultsItemType,
    searchTerm: string,
  ) => boolean,
  filteredCount: number,
): { activeFilters: ActiveColumnFilter[]; hiddenCount: number } {
  const activeFilters = getActiveColumnFilters(
    columnsConfiguration,
    tableFilters,
  );
  if (!activeFilters.length) {
    return { activeFilters, hiddenCount: 0 };
  }
  const searchOnlyResults = filterResults(
    columnsConfiguration,
    results,
    searchTerm,
    NO_FILTERS,
    resultMatchesSearchTerm,
  );
  return {
    activeFilters,
    hiddenCount: searchOnlyResults.length - filteredCount,
  };
}

function resultMatchesColumnFilter(
  columnsConfiguration: CompareResultsTableConfig,
  result: CombinedResultsItemType,
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
    if (
      columnConfiguration.matchesFunction(
        result as CompareResultsItem,
        filterValueKey,
      )
    ) {
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
  results: CombinedResultsItemType[],
  searchTerm: string,
  tableFilters: Map<string, Set<string>>,
  resultMatchesSearchTerm: (
    result: CombinedResultsItemType,
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
