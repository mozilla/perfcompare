import { useState } from 'react';

import { FormControlLabel, FormGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { useLoaderData, useSearchParams } from 'react-router';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { SwitchRaw } from '../../styles';
import type { LoaderReturnValue } from '../CompareResults/loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from '../CompareResults/overTimeLoader';

type CombinedLoaderReturnValue = LoaderReturnValue | OverTimeLoaderReturnValue;

function ToggleReplicatesButton() {
  const theme = useAppSelector((state) => state.theme.mode);
  const loaderData = useLoaderData<CombinedLoaderReturnValue>();

  const switchStyle = SwitchRaw(theme === 'light' ? 'light' : 'dark');

  const [toggleReplicates, setToggleReplicates] = useState(
    loaderData.replicates,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const onToggleReplicates = () => {
    setToggleReplicates(!toggleReplicates);
    if (!toggleReplicates) {
      searchParams.set('replicates', '');
    } else {
      searchParams.delete('replicates');
    }
    setSearchParams(searchParams);
  };

  const styles = {
    box: style({
      $nest: {
        '.toggle-switch': {
          ...switchStyle.stylesRaw,
        },
      },
    }),
  };

  return (
    <Box className={`${styles.box}`}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              className='toggle-switch'
              checked={toggleReplicates}
              onChange={onToggleReplicates}
            />
          }
          label='Replicates'
          labelPlacement='start'
        />
      </FormGroup>
    </Box>
  );
}

export default ToggleReplicatesButton;
