import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { style } from 'typestyle';

import { repoMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { ButtonsLightRaw, ButtonsDarkRaw } from '../../styles';
import { InputType, Repository } from '../../types/state';

interface SearchDropdownProps {
  compact: boolean;
  selectLabel: string;
  searchType: InputType;
  repository: Repository['name'];
  labelIdInfo: string;
  name?: string;
  onChange: (val: Repository['name']) => unknown;
}

//handle in progress repos here if necessary
function SearchDropdown({
  compact,
  searchType,
  repository,
  labelIdInfo,
  name,
  onChange,
}: SearchDropdownProps) {
  const size = compact ? 'small' : undefined;
  const mode = useAppSelector((state) => state.theme.mode);

  const handleRepoSelect = (event: SelectChangeEvent) => {
    const selectedRepository = event.target.value as Repository['name'];
    onChange(selectedRepository);
  };

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
          name={name}
          MenuProps={{
            classes: {
              paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
            },
          }}
        >
          {Object.values(repoMap).map((repoName) => (
            <MenuItem
              id={repoName}
              value={repoName}
              key={repoName}
              className={`${searchType}Repository`}
            >
              {repoName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

export default SearchDropdown;
