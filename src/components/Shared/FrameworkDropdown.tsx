import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { frameworkMap } from '../../common/constants';
import { DropDownItems } from '../../styles/DropDownMenu';
import { ThemeMode } from '../../types/state';
import type { Framework } from '../../types/types';

interface FrameworkDropdownProps {
  frameworkId: Framework['id'];
  labelId?: string;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  mode: ThemeMode;
  onChange: (frameworkId: Framework['id']) => void;
}

const sortFrameworks = (
  frameworks: Record<Framework['id'], Framework['name']>,
) => {
  const unsortedArray = Object.entries(frameworks);

  // Sort the array based on values
  const sortedArray = unsortedArray.sort((a, b) => {
    return a[1].localeCompare(b[1]);
  });

  return sortedArray;
};

const sortedFrameworks = sortFrameworks(frameworkMap);

function FrameworkDropdown({
  frameworkId,
  labelId,
  variant,
  size,
  onChange,
  mode,
}: FrameworkDropdownProps) {
  const menuItemStyles =
    mode === 'light' ? DropDownItems.Light : DropDownItems.Dark;
  const onValueChange = (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    onChange(id);
  };

  return (
    <Select
      data-testid='framework-select'
      value={frameworkId.toString()}
      labelId={labelId}
      className='framework-dropdown-select'
      onChange={onValueChange}
      name='framework'
      variant={variant}
      size={size}
      MenuProps={{
        classes: {
          paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
        },
      }}
      inputProps={{
        classes: {
          select: mode === 'light' ? 'select-light' : 'select-dark',
        },
        'aria-label': 'Framework',
      }}
    >
      {sortedFrameworks.map(([id, name]) => (
        <MenuItem
          value={id}
          key={name}
          className={`framework-dropdown-item ${menuItemStyles}`}
        >
          {name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default FrameworkDropdown;
