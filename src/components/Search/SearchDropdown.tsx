import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style, cssRule } from 'typestyle';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import useHandleChangeDropdown from '../../hooks/useHandleChangeDropdown';
import {
  Spacing,
  ButtonsLightRaw,
  ButtonsDarkRaw,
  TooltipRaw,
  FontsRaw,
  Colors,
  DropDownMenuRaw,
  DropDownItemRaw,
} from '../../styles';
import { InputType } from '../../types/state';

interface SearchDropdownProps {
  view: 'compare-results' | 'search';
  selectLabel: string;
  tooltipText: string;
  mode: 'light' | 'dark';
  searchType: InputType;
}

function SearchDropdown({
  view,
  selectLabel,
  tooltipText,
  mode,
  searchType,
}: SearchDropdownProps) {
  const size = view == 'compare-results' ? 'small' : undefined;
  const { handleChangeDropdown } = useHandleChangeDropdown();
  const searchState = useAppSelector(
    (state: RootState) => state.search[searchType],
  );
  const { repository } = searchState;

  const handleRepoSelect = async (event: SelectChangeEvent) => {
    const selectedRepository = event.target.value;
    await handleChangeDropdown({ selectedRepository, searchType });
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

  cssRule('.MuiPopover-root', {
    $nest: {
      '.MuiPaper-root': {
        flexDirection: 'column',
        ...(mode === 'light' ? DropDownMenuRaw.Light : DropDownMenuRaw.Dark),
        $nest: {
          '.MuiList-root': {
            padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
            $nest: {
              '.MuiMenuItem-root': {
                ...(mode === 'light'
                  ? DropDownItemRaw.Light
                  : DropDownItemRaw.Dark),
              },
            },
          },
        },
      },
    },
  });

  const styles = {
    container: style({
      width: '100%',
      marginBottom: `${Spacing.xLarge}px`,

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
    <div>
      <FormControl
        size={size}
        className={`search-dropdown ${styles.container}`}
      >
        <InputLabel
          id='select-repository-label'
          className='dropdown-select-label'
        >
          {selectLabel}
          <Tooltip placement='top' title={tooltipText}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        <Select
          data-testid={`dropdown-select-${searchType}`}
          label={selectLabel}
          value={repository}
          labelId='select-repository-label'
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
    </div>
  );
}

export default SearchDropdown;
