import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style } from 'typestyle';

import { timeRangeMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import {
  ButtonsLightRaw,
  ButtonsDarkRaw,
  DropDownItems,
  DateRange,
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
  };

  const handleTimeRangeSelect = async (event: SelectChangeEvent) => {
    const value = +event.target.value as TimeRange['value'];
    onChange(value);
  };
  const menuItemStyles =
    mode === 'light' ? DropDownItems.Light : DropDownItems.Dark;
  const dateRangeStyles = mode === 'light' ? DateRange.Light : DateRange.Dark;

  const displayDateRange = (value: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const fromDate = new Date(
      Date.now() - Number(value) * 1000,
    ).toLocaleDateString('en-US', options);
    const toDate = new Date(Date.now()).toLocaleDateString('en-US', options);
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
              className={`timerange-dropdown-item ${menuItemStyles}`}
            >
              {text}
              <span className={`${FontSize.Small} ${dateRangeStyles}`}>
                {displayDateRange(value)}
              </span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

export default TimeRangeDropdown;
