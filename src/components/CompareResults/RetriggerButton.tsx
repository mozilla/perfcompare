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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
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

function RetriggerCountSelect({
  prefix,
  label,
}: {
  prefix: string;
  label: string;
}) {
  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={`${prefix}-retrigger-count-label`}>{label}</InputLabel>
      <Select
        labelId={`${prefix}-retrigger-count-label`}
        name={`${prefix}-retrigger-count`}
        defaultValue={0}
        label={label}
        sx={{ height: 32 }}
      >
        <MenuItem value={0}>0</MenuItem>
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={3}>3</MenuItem>
        <MenuItem value={4}>4</MenuItem>
        <MenuItem value={5}>5</MenuItem>
      </Select>
    </FormControl>
  );
}

type RetriggerModalProps = {
  open: boolean;
  onClose: () => unknown;
  onRetriggerClick: (times: { baseTimes: number; newTimes: number }) => unknown;
};

function RetriggerModal(props: RetriggerModalProps) {
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseCount = formData.get('base-retrigger-count');
    const newCount = formData.get('new-retrigger-count');
    props.onRetriggerClick({
      baseTimes: baseCount ? +baseCount : 0,
      newTimes: newCount ? +newCount : 0,
    });
  };

  return (
    <CenteredModal
      open={props.open}
      onClose={props.onClose}
      ariaLabelledby='retrigger-modal-title'
      paperStyle={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography id='retrigger-modal-title' component='h2' variant='h2'>
        Retrigger jobs
      </Typography>
      <Typography>
        Choose how many clones of the base and new tasks will be started.
      </Typography>
      <form onSubmit={onFormSubmit}>
        <Grid container gap={1}>
          <Grid item xs={3}>
            <RetriggerCountSelect prefix='base' label='Base' />
          </Grid>
          <Grid item xs={3}>
            <RetriggerCountSelect prefix='new' label='New' />
          </Grid>
          <Grid item xs='auto' ml='auto'>
            <Button type='submit'>Retrigger</Button>
          </Grid>
        </Grid>
      </form>
    </CenteredModal>
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
