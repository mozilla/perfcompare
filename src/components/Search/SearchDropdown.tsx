import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style, cssRule } from 'typestyle';

import { repoMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import {
  ButtonsLightRaw,
  ButtonsDarkRaw,
  TooltipRaw,
  FontsRaw,
  Colors,
} from '../../styles';
import { InputType, Repository } from '../../types/state';

interface SearchDropdownProps {
  compact: boolean;
  selectLabel: string;
  searchType: InputType;
  repository: Repository['name'];
  labelIdInfo: string;
  onChange: (val: Repository['name']) => unknown;
}

//handle in progress repos here if necessary
function SearchDropdown({
  compact,
  searchType,
  repository,
  labelIdInfo,
  onChange,
}: SearchDropdownProps) {
  const size = compact ? 'small' : undefined;
  const mode = useAppSelector((state) => state.theme.mode);

  const handleRepoSelect = async (event: SelectChangeEvent) => {
    const selectedRepository = event.target.value as Repository['name'];
    onChange(selectedRepository);
  };

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
  };

  return (
    <>
      <FormControl
        size={size}
        className={`search-dropdown ${styles.container}`}
      >
        <Select
          data-testid={`dropdown-select-${labelIdInfo}`}
          value={repository}
          labelId={labelIdInfo}
          className='dropdown-select'
          variant='standard'
          onChange={(e) => void handleRepoSelect(e)}
        >
          {Object.keys(repoMap).map((key) => (
            <MenuItem
              id={repoMap[key]}
              value={repoMap[key]}
              key={repoMap[key]}
              className={`${searchType}Repository`}
            >
              {repoMap[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

export default SearchDropdown;
