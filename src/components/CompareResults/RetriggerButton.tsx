import { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  IconButton,
  Modal,
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';

import TaskclusterLogo from '../../assets/taskcluster-logo.png';
import {
  getTaskclusterCredentials,
  getTaskclusterParams,
  retrigger,
  signInIntoTaskcluster,
} from '../../logic/taskcluster';
import {
  fetchDecisionTaskIdFromPushId,
  fetchJobInformationFromJobId,
} from '../../logic/treeherder';
import { Strings } from '../../resources/Strings';
import { CompareResultsItem } from '../../types/state';

type CenteredModalProps = {
  open: boolean;
  onClose: () => unknown;
  ariaLabelledby: string;
  children: React.ReactNode;
  paperStyle?: React.ComponentProps<typeof Paper>['sx'];
};

function CenteredModal(props: CenteredModalProps) {
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

type SignInModalProps = {
  open: boolean;
  onClose: () => unknown;
  onSignIn: () => unknown;
};
function SignInModal(props: SignInModalProps) {
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
        Sign into Taskcluster to re-trigger the comparison
      </Typography>
      <Typography>
        To be able to retrigger a task within Taskcluster, it’s necessary that
        you log in to it first. Then PerfCompare will retrigger the task on your
        behalf.
      </Typography>
      <Button
        onClick={onSignInButtonClick}
        disabled={waitingSignIn}
        sx={{ marginTop: 1 }}
      >
        Sign in
      </Button>
      <Button variant='text' size='small' sx={{ padding: 0 }} onClick={onClose}>
        Not now
      </Button>
    </CenteredModal>
  );
}

type RetriggerModalProps = {
  open: boolean;
  onClose: () => unknown;
  onRetriggerClick: (times: { baseTimes: number; newTimes: number }) => unknown;
};

function RetriggerModal({ open, onClose }: RetriggerModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='retrigger-modal-title'
      sx={{ display: 'flex' }}
    >
      <Box>
        <Typography id='retrigger-modal-title' component='h2'>
          Configure the number of retriggers
        </Typography>
      </Box>
    </Modal>
  );
}

type Status = 'pending' | 'signin-modal' | 'retrigger-modal';

interface RetriggerButtonProps {
  result: CompareResultsItem;
}

function RetriggerButton({ result }: RetriggerButtonProps) {
  const {
    base_repository_name: baseRepository,
    base_retriggerable_job_ids: baseRetriggerableJobIds,
    new_repository_name: newRepository,
    new_retriggerable_job_ids: newRetriggerableJobIds,
  } = result;

  const [status, setStatus] = useState('pending' as Status);

  const getRetriggerConfig = async (
    repository: string,
    jobId: number,
    times: number,
  ) => {
    const tcParams = getTaskclusterParams();

    const jobInfo = await fetchJobInformationFromJobId(repository, jobId);
    const decisionTaskId = await fetchDecisionTaskIdFromPushId(
      repository,
      jobInfo.push_id,
    );

    const config = {
      rootUrl: tcParams.url,
      jobInfo,
      decisionTaskId,
      times,
    };

    return config;
  };

  const onRetriggerButtonClick = async () => {
    const credentials = getTaskclusterCredentials();
    if (!credentials) {
      setStatus('signin-modal');
      return;
    }

    setStatus('retrigger-modal');
  };

  const onSignIn = async () => {
    await signInIntoTaskcluster();
    setStatus('retrigger-modal');
  };

  const onRetriggerConfirm = async ({
    baseTimes,
    newTimes,
  }: {
    baseTimes: number;
    newTimes: number;
  }) => {
    setStatus('pending');

    const baseRetriggerConfigPromise = getRetriggerConfig(
      baseRepository,
      baseRetriggerableJobIds[0],
      baseTimes,
    );

    const newRetriggerConfigPromise = getRetriggerConfig(
      newRepository,
      newRetriggerableJobIds[0],
      newTimes,
    );

    const [baseRetriggerTaskId, newRetriggerTaskId] = await Promise.all([
      baseRetriggerConfigPromise.then(retrigger),
      newRetriggerConfigPromise.then(retrigger),
    ]);
    console.log('Retrigger taskId for base: ', baseRetriggerTaskId);
    console.log('Retrigger taskId for new: ', newRetriggerTaskId);
  };

  return (
    <>
      <IconButton
        title={Strings.components.revisionRow.title.retriggerJobs}
        color='primary'
        size='small'
        onClick={() => void onRetriggerButtonClick()}
      >
        <RefreshOutlinedIcon />
      </IconButton>
      <SignInModal
        open={status === 'signin-modal'}
        onClose={() => setStatus('pending')}
        onSignIn={onSignIn}
      />
      <RetriggerModal
        open={status === 'retrigger-modal'}
        onClose={() => setStatus('pending')}
        onRetriggerClick={onRetriggerConfirm}
      />
    </>
  );
}

export default RetriggerButton;
