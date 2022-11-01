import * as React from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import { userFeedbackMessage, perfCompareEmail } from '../../common/constants';

export default function FeedbackAlert() {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
        <IconButton color="inherit"
          onClick={handleClick}
          aria-label="info-button"
        >
          <InfoOutlinedIcon />
        </IconButton>
        <Snackbar
          open={open}
          autoHideDuration={10000}
          onClose={handleClose}
        >
          <Alert variant="filled" severity="info" className="feedback-alert" onClose={handleClose} data-testid="feedback-alert">
          <AlertTitle>Give us feedback!</AlertTitle>
            {userFeedbackMessage} — <strong><a href="mailto:perfcompare-user-feedback@mozilla.com">{perfCompareEmail}</a></strong>
          </Alert>
        </Snackbar>
      </Box>
    </ClickAwayListener>
  );
}


