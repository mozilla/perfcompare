import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style } from 'typestyle';

import { frameworkMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonsDarkRaw, ButtonsLightRaw, Spacing } from '../../styles';
import type { Framework } from '../../types/types';

const strings = Strings.components.searchDefault.sharedCollasped.framkework;

interface FrameworkDropdownProps {
  frameworkId: Framework['id'];

  onChange: (event: SelectChangeEvent) => void;
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

function ResultsFrameworkDropdown({
  frameworkId,

  onChange,
}: FrameworkDropdownProps) {
  const mode = useAppSelector((state) => state.theme.mode);

  const stylesSelect = {
    box: style({
      display: 'flex',
      gap: '1px',
      $nest: {
        '.MuiInputBase-root': {
          ...(mode === 'light'
            ? ButtonsLightRaw.Dropdown
            : ButtonsDarkRaw.Dropdown),
        },
      },
    }),
    select: style({
      marginRight: Spacing.Default,
      marginLeft: Spacing.Default,
    }),
  };

  return (
    <Box data-testid={'dropdown-select'}>
      <Select
        data-testid='dropdown-select-framework'
        label={strings.selectLabel}
        value={`${frameworkId}`}
        labelId='select-framework-label'
        className={`${stylesSelect.select} dropdown-select`}
        onChange={onChange}
        size='small'
        name='framework'
      >
        {sortedFrameworks.map(([id, name]) => (
          <MenuItem value={id} key={name} className='framework-dropdown-item'>
            {name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default ResultsFrameworkDropdown;
