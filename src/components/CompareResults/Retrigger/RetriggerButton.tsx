import { useState } from 'react';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton, Button } from '@mui/material';
import { useSnackbar } from 'notistack';

import { RetriggerConfigModal } from './RetriggerConfigModal';
import { RetriggerSignInModal } from './RetriggerSignInModal';
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

type Status = 'pending' | 'signin-modal' | 'retrigger-modal';

export function DisabledRetriggerButton() {
  return (
    <Button
      title='Retrigger test'
      color='primary'
      variant='text'
      startIcon={<RefreshOutlinedIcon />}
      disabled
    >
      Retrigger test
    </Button>
  );
}

interface RetriggerButtonProps {
  result: CompareResultsItem;
  variant: 'icon' | 'text';
}

export function RetriggerButton({ result, variant }: RetriggerButtonProps) {
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

  const onRetriggerButtonClick = () => {
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
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left',
      },
      autoHideDuration: 10000, // The default (6000ms) configured in App.tsx seems a bit low for this notification
      // It's common that 2 notifications are sent (one for base, one for
      // new), so specifying the width makes them look more consistent.
      // This maxWidth is copied from notistack's own style.
      style: { width: '1000px', maxWidth: 'calc(100vw - 40px)' },
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

    let baseRetriggerPromise = null;
    if (baseRetriggerableJobIds.length > 0) {
      baseRetriggerPromise = getRetriggerConfig(
        baseRepository,
        baseRetriggerableJobIds[0],
        baseTimes,
      ).then(retrigger);
    }

    let newRetriggerPromise = null;
    if (newRetriggerableJobIds.length > 0) {
      newRetriggerPromise = getRetriggerConfig(
        newRepository,
        newRetriggerableJobIds[0],
        newTimes,
      ).then(retrigger);
    }

    const [baseRetriggerTaskId, newRetriggerTaskId] = await Promise.all([
      baseRetriggerPromise,
      newRetriggerPromise,
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
      {variant === 'text' ? (
        <Button
          title={Strings.components.revisionRow.title.retriggerJobs}
          color='primary'
          variant='text'
          onClick={() => void onRetriggerButtonClick()}
          startIcon={<RefreshOutlinedIcon />}
        >
          Retrigger test
        </Button>
      ) : (
        <IconButton
          title={Strings.components.revisionRow.title.retriggerJobs}
          color='primary'
          size='small'
          onClick={() => void onRetriggerButtonClick()}
        >
          <RefreshOutlinedIcon />
        </IconButton>
      )}
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
