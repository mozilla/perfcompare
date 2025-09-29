import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { ThemeMode } from '../../types/state';

interface TestVersionDropdownProps {
  testType: string;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  mode: ThemeMode;
  onChange: (test_version: string) => void;
}

const TEST_VERSIONS = [
  { type: 'mann-whitney-u', label: 'Mann-Whitney-U' },
  { type: 'student-t', label: 'Student-T' },
];

function TestVersionDropdown({
  testType,
  variant,
  size,
  onChange,
  mode,
}: TestVersionDropdownProps) {
  const onValueChange = (event: SelectChangeEvent) => {
    const test_version = event.target.value;
    onChange(test_version);
  };

  return (
    <Select
      data-testid='test-version-select'
      value={testType}
      labelId={'test-version-type'}
      className='test-version-select'
      onChange={onValueChange}
      name='test-version'
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
      {TEST_VERSIONS.map(({ label, type }) => (
        <MenuItem value={type} key={type} className={`statistic-test-item`}>
          {label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default TestVersionDropdown;
