import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ToggleDarkMode from './ToggleDarkModeButton';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { HeaderStyles } from '../../styles';

interface PerfCompareHeaderProps {
  isHome?: boolean;
}

const strings = Strings.components.header;

function PerfCompareHeader({ isHome }: PerfCompareHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = HeaderStyles(themeMode, isHome ?? false);

  return (
    <Grid className={`header-container ${styles.container}`}>
      <ToggleDarkMode />
      <Box className='header-text'>
        <Typography
          variant='h1'
          align='center'
          gutterBottom
          className='perfcompare-header'
        >
          {strings.title}
        </Typography>
        {isHome ? (
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
        ) : null}
      </Box>
    </Grid>
  );
}

export default PerfCompareHeader;
