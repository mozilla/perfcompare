import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { frameworkMap } from '../../common/constants';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
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
  return (
    <Box display='flex' gap='1px' data-testid={'dropdown-select'}>
      <Select
        data-testid='framework-select'
        label={strings.selectLabel}
        value={`${frameworkId}`}
        labelId='select-framework-label-results'
        className='framework-dropdown-select-results'
        onChange={onChange}
        size='small'
        name='frameworkResults'
        sx={{
          marginRight: `${Spacing.Default}px`,
          marginLeft: `${Spacing.Default}px`,
        }}
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
