import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Dialog, Paper } from '@mui/material';

type CenteredModalProps = {
  open: boolean;
  onClose: () => unknown;
  ariaLabelledby: string;
  children: React.ReactNode;
  paperStyle?: React.ComponentProps<typeof Paper>['sx'];
};

export function CenteredModal(props: CenteredModalProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby={props.ariaLabelledby}
      slotProps={{
        paper: {
          sx: {
            gap: 2,
            padding: 6,
            ...props.paperStyle,
          },
        },
      }}
    >
      <IconButton
        aria-label='Close'
        size='large'
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={props.onClose}
      >
        <CloseIcon />
      </IconButton>
      {props.children}
    </Dialog>
  );
}
