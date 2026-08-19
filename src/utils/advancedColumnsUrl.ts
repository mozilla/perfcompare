import type { AdvancedColumns } from '../types/types';

// The advanced (power-user) columns are persisted in the URL so a shared link
// reproduces the selected columns. Encoded as a comma-separated list of the
// enabled column keys, e.g. `?advanced_columns=cliffs_delta,cles`. An absent
// param means neither is shown (the simplified view).
export const ADVANCED_COLUMNS_PARAM = 'advanced_columns';

// The URL key for each advanced column. Exported so the dropdown's option
// values reuse them and can't drift from the URL encoding.
export const CLIFFS_DELTA = 'cliffs_delta';
export const CLES = 'cles';
export const SIGNIFICANCE = 'significance';

// Parse advanced-column visibility from a URL search string or params.
export function parseAdvancedColumns(
  search: string | URLSearchParams,
): AdvancedColumns {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : search;
  const enabled = (params.get(ADVANCED_COLUMNS_PARAM) ?? '')
    .split(',')
    .filter(Boolean);
  return {
    cliffsDelta: enabled.includes(CLIFFS_DELTA),
    cles: enabled.includes(CLES),
    significance: enabled.includes(SIGNIFICANCE),
  };
}

// Serialize to the comma-list value, or null when no advanced column is on so
// the caller can delete the param and keep shared URLs clean.
export function serializeAdvancedColumns(
  advanced: AdvancedColumns,
): string | null {
  const enabled = [
    advanced.cliffsDelta ? CLIFFS_DELTA : null,
    advanced.cles ? CLES : null,
    advanced.significance ? SIGNIFICANCE : null,
  ].filter(Boolean);
  return enabled.length ? enabled.join(',') : null;
}
