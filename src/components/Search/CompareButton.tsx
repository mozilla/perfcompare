import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { ButtonStyles } from '../../styles';

interface CompareButtonProps {
  label: string;
}

export default function CompareButton({ label }: CompareButtonProps) {
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
    >
      {label}
    </Button>
  );
}
