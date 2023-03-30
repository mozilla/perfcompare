import { Stack, Chip } from '@mui/material';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import useFilterCompareResults from '../../hooks/useFilterCompareResults';
import { ActiveFilters } from '../../types/types';

const FilterStatusChip = (props: FilterStatusChipProps) => {
  const { color } = props;
  const { setFilters } = useFilterCompareResults();
  const activeFilters: ActiveFilters = useAppSelector(
    (state: RootState) => state.filterCompareResults.activeFilters,
  );

  const handleDelete = (column: string, value: string) => {
    const isChecked =
      !activeFilters[column as keyof typeof activeFilters].includes(value);
    setFilters(value, isChecked, column);
  };

  return (
    <Stack direction="row" spacing={1}>
      {Object.entries(activeFilters).map(([key, values]) =>
        values.map((item: string) => (
          <Chip
            key={`chip-${item}`}
            data-testid={`chip-${item}`}
            label={item}
            color={color || 'default'}
            size="small"
            variant="outlined"
            onDelete={() => {
              handleDelete(key, item);
            }}
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
