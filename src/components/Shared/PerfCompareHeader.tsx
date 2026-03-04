import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { NavBarLink } from './NavBarLink';
import ToggleDarkMode from './ToggleDarkModeButton';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { HeaderStyles } from '../../styles';
import { Spacing } from '../../styles/Spacing';

interface PerfCompareHeaderProps {
  isHome?: boolean;
}

const strings = Strings.components.header;

function PerfCompareHeader({ isHome }: PerfCompareHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = HeaderStyles(themeMode, isHome ?? false);

  return (
    <Grid className={`header-container ${styles.container}`}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBotton: 2,
        }}
      >
        <ToggleDarkMode />
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: `${Spacing.Large}px`,
          }}
        >
          <NavBarLink
            href={Strings.components.docs.href}
            text={Strings.components.docs.linkText}
            tooltip={Strings.components.docs.tooltip}
          />
          <NavBarLink
            href={Strings.components.source.href}
            text={Strings.components.source.linkText}
            tooltip={Strings.components.source.tooltip}
          />
          <NavBarLink
            href={Strings.components.contact.href}
            text={Strings.components.contact.linkText}
            tooltip={Strings.components.contact.tooltip}
          />
          <NavBarLink
            href={Strings.components.bugs.href}
            text={Strings.components.bugs.linkText}
            tooltip={Strings.components.bugs.tooltip}
          />
        </Box>
      </Box>
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
