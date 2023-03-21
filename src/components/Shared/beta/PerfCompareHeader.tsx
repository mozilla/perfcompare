import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Spacing, ButtonsLightRaw, Colors } from '../../../styles';
import ToggleDarkMode from './ToggleDarkModeButton';

const strings = Strings.components.header;

const styles = {
  container: style({
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '357px',
    backgroundColor: Colors.Background200,
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
        ...ButtonsLightRaw.Secondary,
        marginBottom: `${Spacing.layoutLarge + 14}px`,
        maxWidth: '104px',
        alignSelf: 'center',
      },
      '.leanmore-btn': {
        //hidden until purpose is determined
        visibility: 'hidden',
      },
    },
  }),
};

function PerfCompareHeader() {
  return (
    <div className={`header-container ${styles.container}`}>
      <ToggleDarkMode />
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
    </div>
  );
}

export default PerfCompareHeader;
