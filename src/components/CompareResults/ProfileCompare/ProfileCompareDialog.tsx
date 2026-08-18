import { useEffect, useState } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

import {
  buildCompareBenchmarkUrl,
  buildSingleProfileUrl,
  SPEEDOMETER3_PROFILE_ARTIFACT,
} from './urls';
import {
  fetchTaskArtifacts,
  fetchTaskStatus,
} from '../../../logic/taskcluster';
import { fetchJobInformationFromJobId } from '../../../logic/treeherder';
import { CompareResultsItem } from '../../../types/state';
import { formatNumber } from '../../../utils/format';
import { CenteredModal } from '../Retrigger/CenteredModal';

type RunInfo = {
  jobId: number;
  taskId: string;
  runId: number;
  value: number;
  workerId?: string;
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; base: RunInfo[]; newRuns: RunInfo[] }
  | { kind: 'error'; message: string };

const TC_ROOT_URL = 'https://firefox-ci-tc.services.mozilla.com';

async function loadRunsWithProfiles(
  repo: string,
  jobIds: number[],
  values: number[],
): Promise<RunInfo[]> {
  // Ordering guarantee: values[i] is the score from the job with id jobIds[i].
  // See treeherder/webapp/api/performance_data.py:_get_grouped_perf_data.
  const jobInfos = await Promise.all(
    jobIds.map((jobId) => fetchJobInformationFromJobId(repo, jobId)),
  );
  const details = await Promise.all(
    jobInfos.map(async (jobInfo) => {
      const { task_id: taskId, retry_id: runId } = jobInfo.taskcluster_metadata;
      const [artifacts, status] = await Promise.all([
        fetchTaskArtifacts(TC_ROOT_URL, taskId, runId).catch(() => []),
        fetchTaskStatus(TC_ROOT_URL, taskId).catch(() => null),
      ]);
      return { artifacts, status };
    }),
  );

  const runs: RunInfo[] = [];
  jobInfos.forEach((jobInfo, i) => {
    const { artifacts, status } = details[i];
    const hasProfile = artifacts.some(
      (artifact) => artifact.name === SPEEDOMETER3_PROFILE_ARTIFACT,
    );
    if (!hasProfile) return;
    const { task_id: taskId, retry_id: runId } = jobInfo.taskcluster_metadata;
    const workerId = status?.runs.find((r) => r.runId === runId)?.workerId;
    runs.push({
      jobId: jobIds[i],
      taskId,
      runId,
      value: values[i],
      workerId,
    });
  });
  runs.sort((a, b) => a.value - b.value);
  return runs;
}

function RunList({
  side,
  runs,
  selectedIndex,
  onSelectedIndexChange,
}: {
  side: 'base' | 'new';
  runs: RunInfo[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
}) {
  if (runs.length === 0) {
    return (
      <Typography color='text.secondary' sx={{ fontStyle: 'italic', px: 1 }}>
        No profile artifacts found.
      </Typography>
    );
  }
  return (
    <RadioGroup
      name={`${side}-profile-selection`}
      value={selectedIndex === null ? '' : String(selectedIndex)}
      onChange={(e) => onSelectedIndexChange(Number(e.target.value))}
    >
      {runs.map((run, index) => (
        <Box
          key={run.jobId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.25,
          }}
        >
          <FormControlLabel
            value={String(index)}
            control={<Radio size='small' />}
            label={
              <Typography component='span' sx={{ whiteSpace: 'nowrap' }}>
                Run {index + 1} — score {formatNumber(run.value)}
                {run.workerId && (
                  <Typography
                    component='span'
                    variant='caption'
                    color='text.secondary'
                    sx={{ ml: 1 }}
                  >
                    ({run.workerId})
                  </Typography>
                )}
              </Typography>
            }
            sx={{ flexGrow: 1, m: 0 }}
          />
          <IconButton
            size='small'
            title='View this profile in profiler.firefox.com'
            component={Link}
            href={buildSingleProfileUrl(run.taskId, run.runId)}
            target='_blank'
            rel='noreferrer'
          >
            <OpenInNewIcon fontSize='small' />
          </IconButton>
        </Box>
      ))}
    </RadioGroup>
  );
}

type ProfileCompareDialogProps = {
  open: boolean;
  onClose: () => void;
  result: CompareResultsItem;
};

export function ProfileCompareDialog({
  open,
  onClose,
  result,
}: ProfileCompareDialogProps) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [selectedNew, setSelectedNew] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ kind: 'loading' });
    setSelectedBase(null);
    setSelectedNew(null);

    Promise.all([
      loadRunsWithProfiles(
        result.base_repository_name,
        result.base_retriggerable_job_ids,
        result.base_runs,
      ),
      loadRunsWithProfiles(
        result.new_repository_name,
        result.new_retriggerable_job_ids,
        result.new_runs,
      ),
    ]).then(
      ([base, newRuns]) => {
        if (cancelled) return;
        setState({ kind: 'loaded', base, newRuns });
        if (base.length > 0) setSelectedBase(Math.floor(base.length / 2));
        if (newRuns.length > 0) setSelectedNew(Math.floor(newRuns.length / 2));
      },
      (error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ kind: 'error', message });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [open, result]);

  const canCompare =
    state.kind === 'loaded' &&
    selectedBase !== null &&
    selectedNew !== null &&
    state.base[selectedBase] !== undefined &&
    state.newRuns[selectedNew] !== undefined;

  const compareUrl = canCompare
    ? buildCompareBenchmarkUrl(
        buildSingleProfileUrl(
          state.base[selectedBase].taskId,
          state.base[selectedBase].runId,
        ),
        buildSingleProfileUrl(
          state.newRuns[selectedNew].taskId,
          state.newRuns[selectedNew].runId,
        ),
      )
    : undefined;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      ariaLabelledby='profile-compare-modal-title'
      paperStyle={{ minWidth: 900 }}
    >
      <Typography id='profile-compare-modal-title' component='h2' variant='h2'>
        Profile comparison
      </Typography>
      <Typography color='text.secondary'>
        {result.header_name} — {result.platform}
      </Typography>

      {state.kind === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {state.kind === 'error' && (
        <Alert severity='error'>Failed to load runs: {state.message}</Alert>
      )}

      {state.kind === 'loaded' && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h3' component='h3' sx={{ mb: 1 }}>
              Base ({result.base_rev.slice(0, 12)})
            </Typography>
            <RunList
              side='base'
              runs={state.base}
              selectedIndex={selectedBase}
              onSelectedIndexChange={setSelectedBase}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h3' component='h3' sx={{ mb: 1 }}>
              New ({result.new_rev.slice(0, 12)})
            </Typography>
            <RunList
              side='new'
              runs={state.newRuns}
              selectedIndex={selectedNew}
              onSelectedIndexChange={setSelectedNew}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        {canCompare ? (
          <Button
            variant='contained'
            href={compareUrl!}
            target='_blank'
            rel='noreferrer'
          >
            Open profile comparison
          </Button>
        ) : (
          <Button variant='contained' disabled>
            Open profile comparison
          </Button>
        )}
      </Box>
    </CenteredModal>
  );
}
