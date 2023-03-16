import { Stack, Chip } from '@mui/material';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { ActiveFilters } from '../../types/types';

const FilterStatusChip = (props: FilterStatusChipProps) => {
  const { color } = props;
  const activeFilters: ActiveFilters = useAppSelector(
    (state: RootState) => state.filterCompareResults.activeFilters,
  );

  return (
    <Stack direction="row" spacing={1}>
      {Object.entries(activeFilters).map(([, values]) =>
        values.map((item: string) => (
          <Chip
            key={`chip-${item}`}
            data-testid={`chip-${item}`}
            label={item}
            color={color || 'default'}
            size="small"
            variant="outlined"
          />
        )),
      )}
    </Stack>
  );
};

interface FilterStatusChipProps {
  color: 'success' | 'info';
}
export default FilterStatusChip;
