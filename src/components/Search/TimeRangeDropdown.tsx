import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style, cssRule } from 'typestyle';

import { timeRangeMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateTimeRange } from '../../reducers/TimeRangeSlice';
import { Strings } from '../../resources/Strings';
import {
  Spacing,
  ButtonsLightRaw,
  ButtonsDarkRaw,
  TooltipRaw,
  FontsRaw,
  Colors,
  DropDownMenuRaw,
  DropDownItemRaw,
} from '../../styles';
import type { TimeRange } from '../../types/types';

const strings = Strings.components.searchDefault.overTime.collapsed.timeRange;

function TimeRangeDropdown() {
  const mode = useAppSelector((state) => state.theme.mode);

  cssRule('.MuiTooltip-popper', {
    ...(mode === 'light' ? TooltipRaw.Light : TooltipRaw.Dark),
    $nest: {
      '.MuiTooltip-tooltip': {
        ...(mode === 'light' ? FontsRaw.BodySmall : FontsRaw.BodySmallDark),
        backgroundColor: Colors.ColorTransparent,
        padding: '0px',
        margin: '0px !important',
      },
    },
  });

  cssRule('.MuiPopover-root', {
    $nest: {
      '.MuiPaper-root': {
        flexDirection: 'column',
        ...(mode === 'light' ? DropDownMenuRaw.Light : DropDownMenuRaw.Dark),
        $nest: {
          '.MuiList-root': {
            padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
            $nest: {
              '.MuiMenuItem-root': {
                ...(mode === 'light'
                  ? DropDownItemRaw.Light
                  : DropDownItemRaw.Dark),
              },
            },
          },
        },
      },
    },
  });

  const styles = {
    container: style({
      minWidth: '280px !important',

      $nest: {
        '.MuiInputBase-root': {
          ...(mode === 'light'
            ? ButtonsLightRaw.Dropdown
            : ButtonsDarkRaw.Dropdown),
        },
      },
    }),
  };

  const dispatch = useAppDispatch();
  const timeRangeValue = useAppSelector((state) => state.timeRange.value);

  const handleTimeRangeSelect = async (event: SelectChangeEvent) => {
    const value = +event.target.value as TimeRange['value'];
    const text = timeRangeMap[value];

    dispatch(
      updateTimeRange({
        value,
        text,
      }),
    );
  };

  return (
    <>
      <FormControl className={`timerange-dropdown ${styles.container}`}>
        <InputLabel
          id='select-timerange-label'
          className='dropdown-select-label'
        >
          {strings.selectLabel}
          <Tooltip placement='top' title={strings.tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        <Select
          data-testid='dropdown-select-timerange'
          label={strings.selectLabel}
          value={`${timeRangeValue}`}
          labelId='select-timerange-label'
          className='dropdown-select'
          variant='standard'
          onChange={(e) => void handleTimeRangeSelect(e)}
          name='timerange'
        >
          {Object.entries(timeRangeMap).map(([value, text]) => (
            <MenuItem
              value={value}
              key={text}
              className='timerange-dropdown-item'
            >
              {text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

export default TimeRangeDropdown;
