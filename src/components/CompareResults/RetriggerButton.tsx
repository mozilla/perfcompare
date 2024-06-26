import { useState } from 'react';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton, Modal, Box, Typography, Button } from '@mui/material';

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

type SignInModalProps = {
  open: boolean;
  onClose: () => unknown;
  onSignIn: () => unknown;
};
function SignInModal({ open, onClose, onSignIn }: SignInModalProps) {
  const onSignInButtonClick = () => {
    onSignIn();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='sign-in-modal-title'
      sx={{ display: 'flex' }}
    >
      <Box>
        <Typography id='sign-in-modal-title' component='h2'>
          Sign into Taskcluster to re-trigger the comparison
        </Typography>
        <Button onClick={onSignInButtonClick}>Sign in</Button>
      </Box>
    </Modal>
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
