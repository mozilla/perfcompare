import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Modal, Paper } from '@mui/material';

type CenteredModalProps = {
  open: boolean;
  onClose: () => unknown;
  ariaLabelledby: string;
  children: React.ReactNode;
  paperStyle?: React.ComponentProps<typeof Paper>['sx'];
};

export function CenteredModal(props: CenteredModalProps) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      aria-labelledby={props.ariaLabelledby}
      sx={{ display: 'flex' }}
    >
      <Paper
        sx={{
          margin: 'auto',
          padding: 6,
          maxHeight: 0.6,
          width: 0.6,
          maxWidth: 500,
          overflow: 'auto',
          position: 'relative' /* to be able to position the close icon */,
          ...props.paperStyle,
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
      </Paper>
    </Modal>
  );
}
