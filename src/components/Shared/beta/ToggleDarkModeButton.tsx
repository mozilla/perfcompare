import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Spacing, FontsRaw, SwitchRaw } from '../../../styles';

const strings = Strings.components.header;
const label = { inputProps: { 'aria-label': 'Dark mode switch' } };
const light = SwitchRaw('light');

const styles = {
  box: style({
    display: 'flex',
    alignItems: 'center',
    padding: `${Spacing.xLarge}px`,
    margin: 0,
    $nest: {
      '.toggle-text': {
        ...FontsRaw.BodyDefault,
        paddingRight: `${Spacing.xxLarge}px`,
      },
      '.toggle-switch': {
        ...light.stylesRaw,
      },
    },
  }),
};

function ToggleDarkMode() {
  return (
    <Box className={`toggle-dark-mode ${styles.box}`}>
      <Typography className='toggle-text' component='div' align='left'>
        {strings.darkMode}
      </Typography>
      <Switch className='toggle-switch' {...label} />
    </Box>
  );
}

export default ToggleDarkMode;
