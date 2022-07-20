import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Button,
} from '@mui/material';
import { connect, useSelector } from 'react-redux';

import { RootState } from '../../common/store';
import useFilterCompareResults from '../../hooks/useFilterCompareResults';
import { FilterOptionsListState } from '../../types/state';
import { ActiveFilters } from '../../types/types';

function FilterOptionsList(props: FilterOptionsListProps) {
  const { options, column } : FilterOptionsListProps = props;
  const { setFilters, filterResults } = useFilterCompareResults();
  const activeFilters : ActiveFilters = useSelector((state: RootState) => state.filterCompareResults.activeFilters);

  const handleOnChangeOption = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFilters(e, checked, column);
  };

  const handleApplyOptions = () => {
    filterResults();
  };

  return (
    <List sx={{ width: '100%', maxWidth: 360, maxHeight: 350, bgcolor: 'background.paper' }}>
      {options.map((value) => {
        const labelId = `checkbox-list-label-${value}`;
        return (
          <ListItem
            key={value}
            disablePadding
          >
            <ListItemButton role={undefined} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId, 'value': value }}
                  checked={activeFilters[column as keyof typeof activeFilters].includes(value)}
                  onChange={handleOnChangeOption}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          </ListItem>
        );
      })}
      <ListItem>
        <Button variant="outlined" color="inherit" onClick={handleApplyOptions}>Apply</Button>
      </ListItem>
    </List>
  );
}

interface FilterOptionsListProps {
  options: string[],
  column: string,
  activeFilters: ActiveFilters,
}

function mapStateToProps(state: FilterOptionsListState) {
  return {
    activeFilters: state.activeFilters,
  };
}

export default connect(mapStateToProps)(FilterOptionsList);
