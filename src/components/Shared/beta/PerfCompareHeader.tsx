import type { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import {
  Spacing,
  ButtonsLightRaw,
  ButtonsDarkRaw,
  Colors,
} from '../../../styles';
import ToggleDarkMode from './ToggleDarkModeButton';

const strings = Strings.components.header;

function PerfCompareHeader(props: PerfCompareHeaderProps) {
  const { theme, toggleColorMode } = props;
  const isLightMode = theme.palette.mode;

  const styles = {
    container: style({
      margin: 0,
      padding: 0,
      width: '100%',
      minHeight: '357px',
      backgroundColor:
        isLightMode == 'light'
          ? Colors.Background200
          : Colors.Background200Dark,
      backgroundImage: strings.bgLink,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      $nest: {
        '.header-text': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '472px',
          margin: '0 auto',
        },
        '.perfcompare-header': {
          marginBottom: `${Spacing.Large}px`,
        },
        '.perfcompare-tagline': {
          marginBottom: `${Spacing.xxLarge}px`,
        },
        '.MuiButtonBase-root': {
          marginBottom: `${Spacing.layoutLarge + 14}px`,
          maxWidth: '104px',
          alignSelf: 'center',
          ...(isLightMode == 'light'
            ? ButtonsLightRaw.Secondary
            : ButtonsDarkRaw.Secondary),
        },
        '.learn-more-btn': {
          //hidden until purpose is determined
          //visibility: 'hidden',
        },
      },
    }),
  };
  return (
    <Grid className={`header-container ${styles.container}`}>
      <ToggleDarkMode theme={theme} toggleColorMode={toggleColorMode} />
      <Box className='header-text'>
        <Typography
          variant='h1'
          component='div'
          align='center'
          gutterBottom
          className='perfcompare-header'
        >
          {strings.title}
        </Typography>
        <Typography
          component='div'
          align='center'
          gutterBottom
          className='perfcompare-tagline'
        >
          {strings.tagline}
        </Typography>
        <Button className='learn-more-btn'>{strings.learnMore}</Button>
      </Box>
    </Grid>
  );
}

interface PerfCompareHeaderProps {
  theme: Theme;
  toggleColorMode: () => void;
}

export default PerfCompareHeader;
