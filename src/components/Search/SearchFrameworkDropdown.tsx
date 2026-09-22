import { useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonsLightRaw, ButtonsDarkRaw } from '../../styles';
import type { Framework } from '../../types/types';
import FrameworkMultiSelect from '../Shared/FrameworkMultiSelect';

const strings = Strings.components.searchDefault.sharedCollasped.framework;

interface SearchFrameworkDropdownProps {
  frameworkIdVal: Framework['id'][];
}

function SearchFrameworkDropdown({
  frameworkIdVal,
}: SearchFrameworkDropdownProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const [selectedIds, setSelectedIds] =
    useState<Framework['id'][]>(frameworkIdVal);

  const styles = {
    container: style({
      width: '319px',
      maxWidth: '100%',
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
      <Grid
        size={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 0.75,
        }}
      >
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
      <FrameworkMultiSelect
        selection={selectedIds}
        onChange={setSelectedIds}
        mode={mode}
        name='framework'
        labelId='select-framework-label'
        variant='standard'
      />
    </FormControl>
  );
}

export default SearchFrameworkDropdown;
