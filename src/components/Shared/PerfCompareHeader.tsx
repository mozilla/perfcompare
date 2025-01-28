import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ToggleDarkMode from './ToggleDarkModeButton';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { HeaderStyles } from '../../styles';
import pencilDark from '../../theme/img/pencil-dark.svg';
import pencil from '../../theme/img/pencil.svg';
import EditTitleInput from '../CompareResults/EditTitleInput';

interface PerfCompareHeaderProps {
  isHome?: boolean;
  handleShowInput: () => void;
  onChange: (value: string) => void;
  editTitleInput?: boolean;
}

const strings = Strings.components.header;

function PerfCompareHeader({
  isHome,
  editTitleInput,
  handleShowInput,
  onChange,
}: PerfCompareHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = HeaderStyles(themeMode, isHome ?? false);
  const homePageSx = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '472px',
    margin: '0 auto',
  };

  const resultPageSx = {
    ...homePageSx,
    flexDirection: 'row',
  };

  const buttonIcon = (
    <img
      id='edit-title-icon'
      className='icon icon-edit'
      src={themeMode === 'light' ? pencil.toString() : pencilDark.toString()}
      alt='edit-icon'
    />
  );

  const editTitleText = 'Edit title';
  const cancelText = 'Cancel';
  //add save button and text here for edit title

  return (
    <Grid className={`header-container ${styles.container}`}>
      <ToggleDarkMode />
      <Box className='header-text' sx={isHome ? homePageSx : resultPageSx}>
        {editTitleInput ? (
          <EditTitleInput compact={isHome ?? false} onChange={onChange} />
        ) : (
          <Typography
            variant='h1'
            align='center'
            gutterBottom
            pr={isHome ? '0' : 1}
            className='perfcompare-header'
          >
            {strings.title}
          </Typography>
        )}

        {isHome ? (
          ''
        ) : (
          <Button
            name='edit-title'
            aria-label='edit title'
            startIcon={editTitleInput ? null : buttonIcon}
            className='start-btn'
            variant='text'
            onClick={handleShowInput}
          >
            {editTitleInput ? cancelText : editTitleText}
          </Button>
        )}
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
