import type { ReactNode } from 'react';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { ButtonsLightRaw, ButtonsDarkRaw } from '../../styles';

interface OverTimeSelectOption {
  value: string;
  label: ReactNode;
}

interface OverTimeSelectProps {
  value: string;
  name?: string;
  labelId: string;
  label: string;
  testId: string;
  className: string;
  options: OverTimeSelectOption[];
  onChange: (value: string) => void;
}

function OverTimeSelect({
  value,
  name,
  labelId,
  label,
  testId,
  className,
  options,
  onChange,
}: OverTimeSelectProps) {
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

  const handleSelect = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl className={`${className} ${styles.container}`}>
      <Select
        data-testid={testId}
        label={label}
        value={value}
        labelId={labelId}
        className='dropdown-select'
        variant='standard'
        onChange={(e) => void handleSelect(e)}
        name={name}
        MenuProps={{
          classes: {
            paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
          },
        }}
      >
        {options.map(({ value: optionValue, label: optionLabel }) => (
          <MenuItem
            value={optionValue}
            key={optionValue}
            className={`${className}-item ${styles.menuItem}`}
          >
            {optionLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default OverTimeSelect;
