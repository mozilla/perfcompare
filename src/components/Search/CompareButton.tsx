import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';
import type { ThemeMode } from '../../types/state';

interface CompareButtonProps {
  mode: ThemeMode;
}

const strings = Strings.components.searchDefault.sharedCollasped;

export default function CompareButton({ mode }: CompareButtonProps) {
  const btnStyles = ButtonStyles(mode);

  const styles = {
    button: style({ ...btnStyles.Primary }),
  };

  return (
    <Button
      id='compare-button'
      variant='contained'
      className={`compare-button ${styles.button}`}
      aria-label='compare revisions'
      sx={{ textTransform: 'none !important' }}
      type='submit'
    >
      {strings.button}
    </Button>
  );
}
