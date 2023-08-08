import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Strings } from '../../resources/Strings';
import { HeaderStyles } from '../../styles';
import type { ThemeMode } from '../../types/state';
import ToggleDarkMode from './ToggleDarkModeButton';

interface PerfCompareHeaderProps {
  themeMode: ThemeMode;
  toggleColorMode: () => void;
  view: 'search' | 'compare-results';
}

const strings = Strings.components.header;

function PerfCompareHeader({
  themeMode,
  toggleColorMode,
  view,
}: PerfCompareHeaderProps) {
  const styles = HeaderStyles(themeMode, view);

  return (
    <Grid className={`header-container ${styles.container}`}>
      <ToggleDarkMode theme={themeMode} toggleColorMode={toggleColorMode} />
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
        {view === 'search' && (
          <>
            <Typography
              component='div'
              align='center'
              gutterBottom
              className='perfcompare-tagline'
            >
              {strings.tagline}
            </Typography>
            <Button className='learn-more-btn'>{strings.learnMore}</Button>
          </>
        )}
      </Box>
    </Grid>
  );
}

export default PerfCompareHeader;
