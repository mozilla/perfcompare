import * as React from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import { userFeedbackMessage, perfCompareEmail } from '../../common/constants';

export default function FeedbackAlert() {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason !== 'clickaway') {
      setOpen(false);
    }
  };

  return (
    <Box>
      <IconButton
        aria-label='info-button'
        color='inherit'
        onClick={handleClick}
      >
        <InfoOutlinedIcon />
      </IconButton>
      <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
        <Alert
          className='feedback-alert'
          data-testid='feedback-alert'
          onClose={handleClose}
          severity='info'
          variant='filled'
        >
          <AlertTitle>Give us feedback!</AlertTitle>
          {userFeedbackMessage} —{' '}
          <strong>
            <a href='mailto:perfcompare-user-feedback@mozilla.com'>
              {perfCompareEmail}
            </a>
          </strong>
        </Alert>
      </Snackbar>
    </Box>
  );
}
