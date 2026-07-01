import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { ProfileCompareButton } from '../../components/CompareResults/ProfileCompare/ProfileCompareButton';
import type { CompareResultsItem } from '../../types/state';
import getTestData from '../utils/fixtures';
import { render, screen, waitFor, within } from '../utils/test-utils';

// A minimal speedometer3 row derived from an existing fixture. We only need
// the fields that ProfileCompareButton / Dialog reads.
function makeSpeedometer3Row(
  overrides: Partial<CompareResultsItem> = {},
): CompareResultsItem {
  const base = getTestData().testCompareData[0];
  return {
    ...base,
    suite: 'speedometer3',
    header_name: 'browsertime speedometer3 opt',
    base_repository_name: 'try',
    new_repository_name: 'try',
    base_rev: 'b45e818c8db40353dae549cd7235c8210c58802b',
    new_rev: 'f00ba7f00ba7f00ba7f00ba7f00ba7f00ba7f00b',
    base_retriggerable_job_ids: [111, 222],
    new_retriggerable_job_ids: [333, 444],
    base_runs: [412.3, 415.8],
    new_runs: [425.5, 431.7],
    ...overrides,
  };
}

function mockJobInfo(repo: string, jobId: number, taskId: string, retryId = 0) {
  fetchMock.get(
    `begin:https://treeherder.mozilla.org/api/project/${repo}/jobs/${jobId}/`,
    { taskcluster_metadata: { task_id: taskId, retry_id: retryId } },
  );
}

function mockArtifacts(taskId: string, runId: number, names: string[]) {
  fetchMock.get(
    `https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/${taskId}/runs/${runId}/artifacts`,
    { artifacts: names.map((name) => ({ name })) },
  );
}

function mockTaskStatus(taskId: string, workerId: string, runId = 0) {
  fetchMock.get(
    `https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/${taskId}/status`,
    // Wrap in `body` so fetch-mock doesn't interpret the response's top-level
    // `status` key as an HTTP status code.
    { body: { status: { runs: [{ runId, state: 'completed', workerId }] } } },
  );
}

describe('ProfileCompareButton', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it('shows runs with worker IDs, sorted by score, with the median preselected', async () => {
    // Base has three profiled runs (out-of-order scores) so we can verify
    // both sort-by-score and median preselection. New has two profiled runs
    // (one job with no profile is filtered out).
    const row = makeSpeedometer3Row({
      base_retriggerable_job_ids: [111, 222, 555],
      new_retriggerable_job_ids: [333, 444],
      base_runs: [415.8, 412.3, 418.2],
      new_runs: [425.5, 431.7],
    });

    mockJobInfo('try', 111, 'TASKBASE1');
    mockJobInfo('try', 222, 'TASKBASE2');
    mockJobInfo('try', 555, 'TASKBASE3');
    mockJobInfo('try', 333, 'TASKNEW1');
    mockJobInfo('try', 444, 'TASKNEW2');

    const profile = 'public/test_info/profile_speedometer3_compact.jslb.gz';
    mockArtifacts('TASKBASE1', 0, [profile, 'public/logs/live.log']);
    mockArtifacts('TASKBASE2', 0, [profile]);
    mockArtifacts('TASKBASE3', 0, [profile]);
    mockArtifacts('TASKNEW1', 0, [profile]);
    // No profile on this run — should be filtered out.
    mockArtifacts('TASKNEW2', 0, ['public/logs/live.log']);

    mockTaskStatus('TASKBASE1', 'worker-b1');
    mockTaskStatus('TASKBASE2', 'worker-b2');
    mockTaskStatus('TASKBASE3', 'worker-b3');
    mockTaskStatus('TASKNEW1', 'worker-n1');
    mockTaskStatus('TASKNEW2', 'worker-n2');

    render(<ProfileCompareButton result={row} />);

    const openButton = await screen.findByTitle(
      'open profile comparison for this result',
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(openButton);

    const dialog = await screen.findByRole('dialog');
    // Wait for the dialog to be populated.
    await waitFor(() =>
      expect(
        within(dialog).getByText(/Run 1.*score.*412\.3/),
      ).toBeInTheDocument(),
    );

    // Base runs should appear sorted by score ascending:
    // 412.3 (worker-b2), 415.8 (worker-b1), 418.2 (worker-b3).
    // New runs should appear sorted: 425.5 (worker-n1), 431.7 — actually
    // the only profiled new runs are TASKNEW1 (425.5). TASKNEW2 has no
    // profile artifact so isn't shown.
    const allLabels = within(dialog).getAllByText(/Run \d.*score/);
    // 3 base + 1 new = 4
    expect(allLabels).toHaveLength(4);

    // Worker IDs should be visible.
    expect(within(dialog).getByText(/worker-b2/)).toBeInTheDocument();
    expect(within(dialog).getByText(/worker-n1/)).toBeInTheDocument();

    // Median of base is index 1 (415.8, worker-b1). Only one new run so
    // that's preselected. The compare button should be enabled immediately.
    const activeCompareBtn = within(dialog).getByRole('link', {
      name: 'Open profile comparison',
    });
    expect(activeCompareBtn).toHaveAttribute(
      'href',
      expect.stringContaining('TASKBASE1'),
    );
    expect(activeCompareBtn).toHaveAttribute(
      'href',
      expect.stringContaining('TASKNEW1'),
    );
  });

  it('shows an empty-state message when no runs have profile artifacts', async () => {
    mockJobInfo('try', 111, 'TASKBASE1');
    mockJobInfo('try', 222, 'TASKBASE2');
    mockJobInfo('try', 333, 'TASKNEW1');
    mockJobInfo('try', 444, 'TASKNEW2');

    mockArtifacts('TASKBASE1', 0, ['public/logs/live.log']);
    mockArtifacts('TASKBASE2', 0, ['public/logs/live.log']);
    mockArtifacts('TASKNEW1', 0, ['public/logs/live.log']);
    mockArtifacts('TASKNEW2', 0, ['public/logs/live.log']);

    mockTaskStatus('TASKBASE1', 'worker-b1');
    mockTaskStatus('TASKBASE2', 'worker-b2');
    mockTaskStatus('TASKNEW1', 'worker-n1');
    mockTaskStatus('TASKNEW2', 'worker-n2');

    render(<ProfileCompareButton result={makeSpeedometer3Row()} />);

    const openButton = await screen.findByTitle(
      'open profile comparison for this result',
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(openButton);

    const dialog = await screen.findByRole('dialog');
    const emptyMessages = await within(dialog).findAllByText(
      'No profile artifacts found.',
    );
    // Both sides show the empty message.
    expect(emptyMessages).toHaveLength(2);
  });
});
