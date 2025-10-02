import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { ThemeMode } from '../../types/state';
import { MANN_WHITNEY_U, STUDENT_T } from '../../utils/helpers';

interface TestVersionDropdownProps {
  testType: string;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  mode: ThemeMode;
  onChange: (test_version: string) => void;
}

const TEST_VERSIONS = [
  { type: MANN_WHITNEY_U, label: 'Mann-Whitney-U' },
  { type: STUDENT_T, label: 'Student-T' },
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
      defaultValue={STUDENT_T}
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
