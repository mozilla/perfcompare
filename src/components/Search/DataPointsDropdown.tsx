import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style } from 'typestyle';

import { ALL_DATA_POINTS, dataPointsOptions } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonsLightRaw, ButtonsDarkRaw } from '../../styles';
import type { DataPointsValue } from '../../types/types';

const strings = Strings.components.searchDefault.overTime.collapsed.dataPoints;

interface DataPointsDropdownProps {
  dataPointsValue: DataPointsValue;
  onChange: (val: DataPointsValue) => unknown;
}

function DataPointsDropdown({
  dataPointsValue,
  onChange,
}: DataPointsDropdownProps) {
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
  };

  const handleDataPointsSelect = (event: SelectChangeEvent) => {
    const rawValue = event.target.value;
    const value: DataPointsValue =
      rawValue === ALL_DATA_POINTS
        ? ALL_DATA_POINTS
        : (+rawValue as DataPointsValue);
    onChange(value);
  };

  // When 'all' is selected, the input isn't named, so no parameter is
  // submitted in the form URL and the server returns every data point.
  const selectName =
    dataPointsValue === ALL_DATA_POINTS ? undefined : 'numberOfDataPoints';

  return (
    <FormControl className={`datapoints-dropdown ${styles.container}`}>
      <Select
        data-testid='dropdown-select-datapoints'
        label={strings.selectLabel}
        value={`${dataPointsValue}`}
        labelId='select-datapoints-label'
        className='dropdown-select'
        variant='standard'
        onChange={(e) => void handleDataPointsSelect(e)}
        name={selectName}
        MenuProps={{
          classes: {
            paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
          },
        }}
      >
        {dataPointsOptions.map(({ value, text }) => (
          <MenuItem
            value={`${value}`}
            key={`${value}`}
            className={`datapoints-dropdown-item ${styles.menuItem}`}
          >
            {text}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default DataPointsDropdown;
