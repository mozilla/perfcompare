import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Box } from '@mui/system';
import { style } from 'typestyle';

import { timeRangeMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import {
  ButtonsLightRaw,
  ButtonsDarkRaw,
  DropDownItems,
  FontSize,
} from '../../styles';
import type { TimeRange } from '../../types/types';

const strings = Strings.components.searchDefault.overTime.collapsed.timeRange;

interface TimeRangeDropdownProps {
  timeRangeValue: TimeRange['value'];
  onChange: (val: TimeRange['value']) => unknown;
}

function TimeRangeDropdown({
  timeRangeValue,
  onChange,
}: TimeRangeDropdownProps) {
  const mode = useAppSelector((state) => state.theme.mode);

  const styles = {
    container: style({
      width: '100%',

      $nest: {
        '.MuiInputBase-root': {
          ...(mode === 'light'
            ? ButtonsLightRaw.Dropdown
            : ButtonsDarkRaw.Dropdown),
        },
      },
    }),
    menuItem: style({
      display: 'block',
    }),
    dateRange: style({
      display: 'flex',
      justifyContent: 'space-between',
    }),
  };

  const handleTimeRangeSelect = async (event: SelectChangeEvent) => {
    const value = +event.target.value as TimeRange['value'];
    onChange(value);
  };
  const menuItemStyles =
    mode === 'light' ? DropDownItems.Light : DropDownItems.Dark;

  const displayDateRange = (value: number) => {
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
    };
    const dateFormatter = new Intl.DateTimeFormat('en-US', options);
    const fromDate = dateFormatter.format(new Date(Date.now() - value * 1000));
    const toDate = dateFormatter.format(new Date());
    return ` (${fromDate} - ${toDate})`;
  };

  return (
    <>
      <FormControl className={`timerange-dropdown ${styles.container}`}>
        <Select
          data-testid='dropdown-select-timerange'
          label={strings.selectLabel}
          value={`${timeRangeValue}`}
          labelId='select-timerange-label'
          className='dropdown-select'
          variant='standard'
          onChange={(e) => void handleTimeRangeSelect(e)}
          name='selectedTimeRange'
          MenuProps={{
            classes: {
              paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
            },
          }}
        >
          {Object.entries(timeRangeMap).map(([value, text]) => (
            <MenuItem
              value={value}
              key={value}
              className={`timerange-dropdown-item ${menuItemStyles} ${styles.menuItem}`}
            >
              <div className={styles.dateRange}>
                {text}
                <Box
                  sx={{ color: 'text.secondary' }}
                  className={`${FontSize.Small}`}
                >
                  {displayDateRange(Number(value))}
                </Box>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

export default TimeRangeDropdown;
