import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style, cssRule } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import {
  Spacing,
  ButtonsLightRaw,
  ButtonsDarkRaw,
  DropDownMenuRaw,
  DropDownItemRaw,
} from '../../styles';
import type { Framework } from '../../types/types';
import FrameworkDropdown from '../Shared/FrameworkDropdown';

const strings = Strings.components.searchDefault.sharedCollasped.framework;

interface FrameworkDropdownProps {
  frameworkId: Framework['id'];
  onChange: (event: SelectChangeEvent) => void;
}

function SearchFrameworkComponent({
  frameworkId,
  onChange,
}: FrameworkDropdownProps) {
  const mode = useAppSelector((state) => state.theme.mode);

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
      minWidth: '319px',
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
    <FormControl className={`framework-dropdown ${styles.container}`}>
      <InputLabel id='select-framework-label' className='dropdown-select-label'>
        {strings.selectLabel}
        <Tooltip placement='top' title={strings.tooltip}>
          <InfoIcon fontSize='small' className='dropdown-info-icon' />
        </Tooltip>
      </InputLabel>
      <FrameworkDropdown
        frameworkId={frameworkId}
        labelId='select-framework-label'
        mode={mode}
        frameworkStyles={styles}
        variant='standard'
        onChange={onChange}
      />
    </FormControl>
  );
}

export default SearchFrameworkComponent;
