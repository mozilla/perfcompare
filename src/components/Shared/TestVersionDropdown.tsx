import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { getTestVersionOptions } from '../../common/testVersions';
import { ThemeMode } from '../../types/state';
import { TestVersion } from '../../types/types';

interface TestVersionDropdownProps {
  testType?: TestVersion;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  mode: ThemeMode;
  onChange: (test_version: TestVersion) => void;
}

function TestVersionDropdown({
  testType,
  variant,
  size,
  onChange,
  mode,
}: TestVersionDropdownProps) {
  const onValueChange = (event: SelectChangeEvent) => {
    const test_version = event.target.value as TestVersion;
    onChange(test_version);
  };

  return (
    <Select
      data-testid='test-version-select'
      value={testType}
      labelId={'test-version-type'}
      className='test-version-select'
      onChange={onValueChange}
      name='test_version'
      variant={variant}
      size={size}
      MenuProps={{
        classes: {
          paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
        },
      }}
      inputProps={{
        'aria-label': 'Stats Test Version',
      }}
    >
      {getTestVersionOptions().map(({ label, type }) => (
        <MenuItem value={type} key={type} className={`statistic-test-item`}>
          {label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default TestVersionDropdown;
