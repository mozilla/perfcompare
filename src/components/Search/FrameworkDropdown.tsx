import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style, cssRule } from 'typestyle';

import { frameworkMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateFramework } from '../../reducers/FrameworkSlice';
import { Strings } from '../../resources/Strings';
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
import type { Framework } from '../../types/types';

const strings = Strings.components.searchDefault.sharedCollasped.framkework;

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

function FrameworkDropdown() {
  const mode = useAppSelector((state) => state.theme.mode);

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
      marginBottom: `${Spacing.xLarge}px`,
      minWidth: '319px !important',

      $nest: {
        '.MuiInputBase-root': {
          ...(mode === 'light'
            ? ButtonsLightRaw.Dropdown
            : ButtonsDarkRaw.Dropdown),
        },
      },
    }),
  };

  const dispatch = useAppDispatch();
  const frameworkId = useAppSelector((state) => state.framework.id);

  const handleFrameworkSelect = async (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    const name = frameworkMap[id];

    dispatch(
      updateFramework({
        id,
        name,
      }),
    );
  };

  return (
    <div>
      <FormControl className={`framework-dropdown ${styles.container}`}>
        <InputLabel
          id='select-framework-label'
          className='dropdown-select-label'
        >
          {strings.selectLabel}
          <Tooltip placement='top' title={strings.tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        <Select
          data-testid='dropdown-select-framework'
          label={strings.selectLabel}
          value={`${frameworkId}`}
          labelId='select-framework-label'
          className='dropdown-select'
          variant='standard'
          onChange={(e) => void handleFrameworkSelect(e)}
          name='Framework'
        >
          {sortedFrameworks.map(([id, name]) => (
            <MenuItem value={id} key={name} className='framework-dropdown-item'>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default FrameworkDropdown;
