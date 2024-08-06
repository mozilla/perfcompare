import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { frameworkMap } from '../../common/constants';
import { ThemeMode } from '../../types/state';
import type { Framework } from '../../types/types';

interface FrameworkDropdownProps {
  frameworkId: Framework['id'];
  mode: ThemeMode;
  labelId?: string;
  sxStyles?: React.ComponentProps<typeof Select>['sx'];
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  onChange?: (event: SelectChangeEvent) => void;
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
  sxStyles,
  variant,
  size,
  onChange,
}: FrameworkDropdownProps) {
  return (
    <Select
      data-testid='framework-select'
      value={frameworkId.toString()}
      labelId={labelId}
      className='framework-dropdown-select'
      onChange={onChange}
      name='framework'
      variant={variant}
      size={size}
      sx={sxStyles}
      inputProps={{ 'aria-label': 'Framework' }}
    >
      {sortedFrameworks.map(([id, name]) => (
        <MenuItem value={id} key={name} className='framework-dropdown-item'>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default FrameworkDropdown;
