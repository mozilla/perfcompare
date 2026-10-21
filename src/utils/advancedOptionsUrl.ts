import {
  ADVANCED_COLUMNS_PARAM,
  serializeAdvancedColumns,
} from './advancedColumnsUrl';
import { EXPANDED_ROW_PARAM, serializeExpandedRow } from './expandedRowUrl';
import type { AdvancedColumns, ExpandedRowOptions } from '../types/types';

// Write the whole "Advanced options" selection (columns + expanded row) onto
// `params`, deleting a param when nothing in its group is on so URLs stay
// clean. Used both for the live URL and for the links between the results and
// subtests pages, so the selection carries over in either direction.
export function setAdvancedOptionsParams(
  params: URLSearchParams,
  columns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
): URLSearchParams {
  const setOrDelete = (param: string, value: string | null) =>
    value ? params.set(param, value) : params.delete(param);
  setOrDelete(ADVANCED_COLUMNS_PARAM, serializeAdvancedColumns(columns));
  setOrDelete(EXPANDED_ROW_PARAM, serializeExpandedRow(expandedRow));
  return params;
}
