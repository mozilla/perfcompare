import Alert from '@mui/material/Alert';

import type { ActiveColumnFilter } from '../../hooks/useTableFilters';
import { Strings } from '../../resources/Strings';

interface FilteredRowsNoticeProps {
  // How many rows the column filters are hiding (search-hidden rows excluded).
  hiddenCount: number;
  // The columns doing the hiding, with the value labels they exclude.
  activeFilters: ActiveColumnFilter[];
}

// Tells the user that column filters are hiding rows, and which ones — so a
// comparison that shows fewer rows than expected doesn't read as missing data.
// Renders nothing when no rows are hidden.
function FilteredRowsNotice({
  hiddenCount,
  activeFilters,
}: FilteredRowsNoticeProps) {
  if (hiddenCount <= 0) {
    return null;
  }

  const reasons = activeFilters
    .map((filter) => `${filter.name}: ${filter.excludedLabels.join(', ')}`)
    .join(' • ');

  return (
    <Alert
      severity='info'
      data-testid='filtered-rows-notice'
      sx={{ marginTop: 2 }}
    >
      {Strings.components.filteredRowsNotice.summary(hiddenCount)}
      {reasons ? ` — ${reasons}` : ''}
    </Alert>
  );
}

export default FilteredRowsNotice;
