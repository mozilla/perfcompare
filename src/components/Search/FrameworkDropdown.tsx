import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style, cssRule } from 'typestyle';

import { frameworkMap, frameworks } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import useHandleChangeFrameworkDropdown from '../../hooks/useHandleFrameworkDropdown';
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
import type { ThemeMode, View } from '../../types/state';

interface FrameworkDropdownProps {
  view: View;
  mode: ThemeMode;
}

const strings = Strings.components.searchDefault.sharedCollasped.framkework;

function FrameworkDropdown({ view, mode }: FrameworkDropdownProps) {
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
  const size = view == 'compare-results' ? 'small' : undefined;

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

  const frameworkName = useAppSelector(
    (state) => state.framework.name,
  );

  const { handleChangeFrameworkDropdown } = useHandleChangeFrameworkDropdown();

  const findIdByName = (name: string): number | undefined => {
    const selectedFramework = frameworks.find(
      (framework) => framework.name === name,
    );
    return selectedFramework?.id;
  };

  const handleFrameworkSelect = async (event: SelectChangeEvent) => {
    const name = event.target.value;
    const id = findIdByName(name);

    await handleChangeFrameworkDropdown({ id, name });
  };

  return (
    <div>
      <FormControl
        size={size}
        className={`framework-dropdown ${styles.container}`}
      >
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
          value={frameworkName}
          labelId='select-framework-label'
          className='dropdown-select'
          variant='standard'
          onChange={(e) => void handleFrameworkSelect(e)}
          name='Framework'
        >
          {Object.entries(frameworkMap).map(([id, name]) => (
            <MenuItem
              id={id}
              value={name}
              key={name}
              className='framework-dropdown-item'
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default FrameworkDropdown;
