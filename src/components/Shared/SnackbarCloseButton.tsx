import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useSnackbar, SnackbarKey } from 'notistack';

function SnackbarCloseButton(props: SnackbarCloseButtonProps) {
  const { closeSnackbar } = useSnackbar();
  const { snackbarKey } = props;

  return (
    <IconButton
      data-testid="alert-close"
      onClick={() => closeSnackbar(snackbarKey)}
    >
      <Close />
    </IconButton>
  );
}

interface SnackbarCloseButtonProps {
  snackbarKey: SnackbarKey;
}

export default SnackbarCloseButton;
