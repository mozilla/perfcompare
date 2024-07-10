import { useState } from 'react';

import { Box, Typography, Button } from '@mui/material';

import TaskclusterLogo from '../../../assets/taskcluster-logo.png';
import { Strings } from '../../../resources/Strings';
import { CenteredModal } from './CenteredModal';

const signinStrings = Strings.components.retrigger.signin;

type SignInModalProps = {
  open: boolean;
  onClose: () => unknown;
  onSignIn: () => unknown;
};
export function RetriggerSignInModal(props: SignInModalProps) {
  const [waitingSignIn, setWaitingSignIn] = useState(false);
  const onSignInButtonClick = () => {
    if (waitingSignIn) {
      return;
    }
    setWaitingSignIn(true);
    props.onSignIn();
  };

  const onClose = () => {
    setWaitingSignIn(false);
    props.onClose();
  };

  return (
    <CenteredModal
      open={props.open}
      onClose={onClose}
      ariaLabelledby='sign-in-modal-title'
      paperStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        paddingBottom: 5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          filter: (theme) =>
            theme.palette.mode === 'dark' ? 'brightness(2)' : null,
        }}
      >
        <img src={TaskclusterLogo} role='presentation' width='48' />
      </Box>
      <Typography id='sign-in-modal-title' component='h2' variant='h2'>
        {signinStrings.title}
      </Typography>
      <Typography>{signinStrings.body}</Typography>
      <Button
        onClick={onSignInButtonClick}
        disabled={waitingSignIn}
        sx={{ marginTop: 1 }}
      >
        {signinStrings.submitButton}
      </Button>
      <Button variant='text' size='small' sx={{ padding: 0 }} onClick={onClose}>
        {signinStrings.cancelButton}
      </Button>
    </CenteredModal>
  );
}
