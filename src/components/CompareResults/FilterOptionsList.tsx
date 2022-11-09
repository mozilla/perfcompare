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

  const handleOnChangeOption = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const { value } = e.target;
    setFilters(value, checked, column);
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
      {options.map((value) => {
        const labelId = `checkbox-list-label-${value}`;
        return (
          value && (
            <ListItem key={value} disablePadding>
              <ListItemButton role={undefined} dense sx={{ maxWidth: 54 }}>
                <ListItemIcon>
                  <Checkbox
                    data-testid={`${value}-checkbox`}
                    edge="start"
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId, value: value }}
                    checked={activeOptions.includes(value)}
                    onChange={handleOnChangeOption}
                  />
                </ListItemIcon>
              </ListItemButton>
              <ListItemText id={labelId} primary={value} />
            </ListItem>
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
