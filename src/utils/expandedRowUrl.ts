import type { ExpandedRowOptions } from '../types/types';

// The advanced (power-user) components of the Mann-Whitney-U expanded row are
// persisted in the URL so a shared link reproduces the expanded view. Encoded
// as a comma-separated list of the enabled keys, e.g.
// `?advanced_expanded=modes,warnings`. Kept in a separate param from the
// advanced columns so the two groups stay independent. An absent param means
// none are shown (the simplified expanded view).
export const EXPANDED_ROW_PARAM = 'advanced_expanded';

// The URL key for each expanded-row option. Exported so the dropdown's option
// values reuse them and can't drift from the URL encoding.
export const EFFECT_SIZE = 'effect_size';
export const MODES = 'modes';
export const STATS_TABLE = 'stats_table';
export const WARNINGS = 'warnings';

// Parse expanded-row visibility from a URL search string or params.
export function parseExpandedRow(
  search: string | URLSearchParams,
): ExpandedRowOptions {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : search;
  const enabled = (params.get(EXPANDED_ROW_PARAM) ?? '')
    .split(',')
    .filter(Boolean);
  return {
    effectSize: enabled.includes(EFFECT_SIZE),
    modes: enabled.includes(MODES),
    statsTable: enabled.includes(STATS_TABLE),
    warnings: enabled.includes(WARNINGS),
  };
}

// Serialize to the comma-list value, or null when nothing is on so the caller
// can delete the param and keep shared URLs clean.
export function serializeExpandedRow(
  options: ExpandedRowOptions,
): string | null {
  const enabled = [
    options.effectSize ? EFFECT_SIZE : null,
    options.modes ? MODES : null,
    options.statsTable ? STATS_TABLE : null,
    options.warnings ? WARNINGS : null,
  ].filter(Boolean);
  return enabled.length ? enabled.join(',') : null;
}
