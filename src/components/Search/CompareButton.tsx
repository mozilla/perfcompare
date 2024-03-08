import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';

const strings = Strings.components.searchDefault.sharedCollasped;

interface CompareButtonProps {
  name: string;
}

export default function CompareButton({ name }: CompareButtonProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const btnStyles = ButtonStyles(mode);

  const styles = {
    button: style({ ...btnStyles.Primary }),
  };

  return (
    <Button
      id='compare-button'
      variant='contained'
      className={`compare-button ${styles.button}`}
      sx={{ textTransform: 'none !important' }}
      type='submit'
      aria-label={name}
    >
      {strings.button}
    </Button>
  );
}
