import { useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonsLightRaw, ButtonsDarkRaw } from '../../styles';
import type { Framework } from '../../types/types';
import FrameworkDropdown from '../Shared/FrameworkDropdown';

const strings = Strings.components.searchDefault.sharedCollasped.framework;

interface SearchFrameworkDropdownProps {
  frameworkId: Framework['id'];
}

function SearchFrameworkDropdown({
  frameworkId,
}: SearchFrameworkDropdownProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const [frameworkIdVal, setframeWorkValue] = useState(frameworkId);

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

  const onChange = (event: SelectChangeEvent) => {
    const id = +event.target.value as Framework['id'];
    setframeWorkValue(id);
  };

  return (
    <FormControl className={`framework-dropdown ${styles.container}`}>
      <Grid item xs={2} display='flex' alignItems='center' mb={0.75}>
        <InputLabel
          id='select-framework-label'
          className='dropdown-select-label'
        >
          {strings.selectLabel}
        </InputLabel>
        <Tooltip
          classes={{
            tooltip: `tooltip-${mode === 'light' ? 'light' : 'dark'}`,
          }}
          placement='top'
          title={strings.tooltip}
        >
          <InfoIcon fontSize='small' className='dropdown-info-icon' />
        </Tooltip>
      </Grid>

      <FrameworkDropdown
        frameworkId={frameworkIdVal}
        labelId='select-framework-label'
        variant='standard'
        onChange={onChange}
        mode={mode}
      />
    </FormControl>
  );
}

export default SearchFrameworkDropdown;
