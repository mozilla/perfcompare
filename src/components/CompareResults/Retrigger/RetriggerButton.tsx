import { useState } from 'react';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton, Button } from '@mui/material';
import { useSnackbar } from 'notistack';

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
import { getTreeherderURL } from '../../../utils/helpers';
import SnackbarCloseButton from '../../Shared/SnackbarCloseButton';
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
    base_rev: baseRev,
    new_rev: newRev,
    base_repository_name: baseRepo,
    new_repository_name: newRepo,
  } = result;

  const [status, setStatus] = useState('pending' as Status);
  const { enqueueSnackbar } = useSnackbar();

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

  const showNotification = (message: string, actionHref: string) => {
    enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: 10000, // The default (6000ms) configured in App.tsx seems a bit low for this notification
      action: (snackbarKey) => (
        <>
          <Button
            href={actionHref}
            target='_blank'
            rel='noreferrer'
            sx={{ marginInline: 2 }}
          >
            {Strings.components.retrigger.notification.treeherderButton}
          </Button>
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        </>
      ),
    });
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

    // Note that the notification for "new" is dispatched before the
    // notification for "base", so that visually "base" is before "new", because
    // they are displayed backwards.
    if (newRetriggerTaskId) {
      showNotification(
        Strings.components.retrigger.notification.body(
          'new',
          newRetriggerTaskId,
        ),
        getTreeherderURL(newRev, newRepo),
      );
    }

    if (baseRetriggerTaskId) {
      showNotification(
        Strings.components.retrigger.notification.body(
          'base',
          baseRetriggerTaskId,
        ),
        getTreeherderURL(baseRev, baseRepo),
      );
    }
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
