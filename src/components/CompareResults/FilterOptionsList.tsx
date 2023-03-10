import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Button,
} from '@mui/material';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import useFilterCompareResults from '../../hooks/useFilterCompareResults';
import { ActiveFilters } from '../../types/types';

function FilterOptionsList(props: FilterOptionsListProps) {
  const { options, column, closeOptions }: FilterOptionsListProps = props;
  const { setFilters, filterResults } = useFilterCompareResults();
  const activeFilters: ActiveFilters = useAppSelector(
    (state: RootState) => state.filterCompareResults.activeFilters,
  );

  const handleOnChangeOption = (value: string) => {
    const isChecked =
      !activeFilters[column as keyof typeof activeFilters].includes(value);
    setFilters(value, isChecked, column);
  };

  const handleApplyOptions = () => {
    closeOptions();
    filterResults();
  };

  const activeOptions = activeFilters[column as keyof typeof activeFilters];

  return (
    <List
      sx={{
        width: '100%',
        maxWidth: 360,
        maxHeight: 350,
        bgcolor: 'background.paper',
        overflow: 'auto',
      }}
      data-testid={`${column}-options`}
    >
      <ListItem>
        <Button
          data-testid="apply-filter"
          variant="outlined"
          color="inherit"
          onClick={handleApplyOptions}
        >
          Apply
        </Button>
      </ListItem>
      {options &&
        options.map((value) => {
          const labelId = `checkbox-list-label-${value}`;
          return (
            value && (
              <ListItemButton
                key={value}
                dense
                onClick={() => handleOnChangeOption(value)}
              >
                <ListItem disablePadding>
                  <ListItemIcon>
                    <Checkbox
                      data-testid={`${value}-checkbox`}
                      edge="start"
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId, value: value }}
                      checked={activeOptions.includes(value)}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={value} />
                </ListItem>
              </ListItemButton>
            )
          );
        })}
      <ListItem>
        <Button
          data-testid="apply-filter"
          variant="outlined"
          color="inherit"
          onClick={handleApplyOptions}
        >
          Apply
        </Button>
      </ListItem>
    </List>
  );
}

interface FilterOptionsListProps {
  options: string[];
  column: string;
  closeOptions: () => void;
}

export default FilterOptionsList;
