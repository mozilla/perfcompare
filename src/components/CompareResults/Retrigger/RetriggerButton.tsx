import { useState } from 'react';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import {
  getTaskclusterCredentials,
  getTaskclusterParams,
  retrigger,
  signInIntoTaskcluster,
} from '../../../logic/taskcluster';
import {
  fetchDecisionTaskIdFromPushId,
  fetchJobInformationFromJobId,
} from '../../../logic/treeherder';
import { Strings } from '../../../resources/Strings';
import { CompareResultsItem } from '../../../types/state';
import { RetriggerConfigModal } from './RetriggerConfigModal';
import { RetriggerSignInModal } from './RetriggerSignInModal';

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
      <RetriggerSignInModal
        open={status === 'signin-modal'}
        onClose={() => setStatus('pending')}
        onSignIn={onSignIn}
      />
      <RetriggerConfigModal
        open={status === 'retrigger-modal'}
        onClose={() => setStatus('pending')}
        onRetriggerClick={onRetriggerConfirm}
      />
    </>
  );
}

export default RetriggerButton;
