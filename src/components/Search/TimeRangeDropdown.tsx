import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Box } from '@mui/system';
import { style } from 'typestyle';

import { timeRangeMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonsLightRaw, ButtonsDarkRaw, FontSize } from '../../styles';
import type { TimeRange } from '../../types/types';
import { formatDateRange } from '../../utils/format';

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
    // This extra flexible div is needed, so that the information looks the same in
    // both the MenuItem (in the dropdown options) and the SelectedItem (in
    // the dropdown, when the dropdown is closed).
    dateRange: style({
      display: 'flex',
      justifyContent: 'space-between',
    }),
  };

  const handleTimeRangeSelect = (event: SelectChangeEvent) => {
    const value = +event.target.value as TimeRange['value'];
    onChange(value);
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
              className={`timerange-dropdown-item ${styles.menuItem}`}
            >
              <div className={styles.dateRange}>
                {text}
                <Box
                  sx={{ color: 'text.secondary' }}
                  className={FontSize.Small}
                >
                  {`(${formatDateRange(
                    new Date(Date.now() - Number(value) * 1000),
                    new Date(),
                  )})`}
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
