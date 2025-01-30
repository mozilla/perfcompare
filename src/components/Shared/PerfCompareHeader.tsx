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
  comparisonTitleName?: string;
  titleError?: boolean;
  handleShowInput: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  editComparisonTitleInputVisible?: boolean;
}

const strings = Strings.components.header;

function PerfCompareHeader({
  isHome,
  comparisonTitleName,
  editComparisonTitleInputVisible,
  handleShowInput,
  onChange,
  onSave,
  titleError,
}: PerfCompareHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = HeaderStyles(themeMode, isHome ?? false);
  const titleErrorMessage = titleError ? 'Title cannot be empty' : null;
  const homePageSx = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '700px',
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

  const deSlugify = (slug: string | undefined) => {
    if (!slug) return '';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const deSlugifiedTitle = deSlugify(comparisonTitleName);

  const renderEditSaveCancelBtns = () => {
    return (
      <>
        {editComparisonTitleInputVisible ? (
          <>
            <Button
              name='cancel-title'
              aria-label='cancel title'
              className='cancel-btn'
              variant='text'
              onClick={handleShowInput}
            >
              Cancel
            </Button>
            <Button
              name='save-title'
              aria-label='save title'
              className='save-btn'
              variant='text'
              onClick={onSave}
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            name='edit-title'
            aria-label='edit title'
            startIcon={buttonIcon}
            className='edit-title-btn'
            variant='text'
            onClick={handleShowInput}
          >
            {editTitleText}
          </Button>
        )}
      </>
    );
  };

  const renderDefaultPerfCompareHeaderOrInput = () => {
    return (
      <>
        {editComparisonTitleInputVisible ? (
          <EditTitleInput
            titleError={titleErrorMessage}
            comparisonTitleName={deSlugifiedTitle}
            compact={isHome ?? false}
            onChange={onChange}
          />
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

        {isHome ? '' : renderEditSaveCancelBtns()}
      </>
    );
  };

  return (
    <Grid className={`header-container ${styles.container}`}>
      <ToggleDarkMode />
      <Box className='header-text' sx={isHome ? homePageSx : resultPageSx}>
        {comparisonTitleName && !editComparisonTitleInputVisible ? (
          <>
            <Typography
              variant='h1'
              align='center'
              gutterBottom
              pr={1}
              className='perfcompare-header'
            >
              {deSlugifiedTitle}
            </Typography>
            {renderEditSaveCancelBtns()}
          </>
        ) : (
          renderDefaultPerfCompareHeaderOrInput()
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
