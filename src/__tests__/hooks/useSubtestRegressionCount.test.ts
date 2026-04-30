import fetchMock from '@fetch-mock/jest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { compareView, compareOverTimeView } from '../../common/constants';
import { useSubtestRegressionCount } from '../../hooks/useSubtestRegressionCount';
import {
  memoizedFetchSubtestsCompareResults,
  memoizedFetchSubtestsCompareOverTimeResults,
} from '../../logic/treeherder';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../types/state';
import type { TestVersion, TimeRange } from '../../types/types';

jest.mock('../../logic/treeherder', () => ({
  memoizedFetchSubtestsCompareResults: jest.fn(),
  memoizedFetchSubtestsCompareOverTimeResults: jest.fn(),
}));

const mockedFetchCompare = memoizedFetchSubtestsCompareResults as jest.Mock;
const mockedFetchCompareOverTime =
  memoizedFetchSubtestsCompareOverTimeResults as jest.Mock;

const baseResult = {
  has_subtests: true,
  base_rev: 'abc123',
  base_repository_name: 'mozilla-central',
  new_rev: 'def456',
  new_repository_name: 'mozilla-central',
  framework_id: 1,
  base_signature_id: 100,
  new_signature_id: 200,
} as unknown as MannWhitneyResultsItem;

// Creates a minimal fake Mann-Whitney subtest result with a given
// direction_of_change. Defaults to null (no change) when omitted.
function makeMannWhitneySubtest(
  direction: 'regression' | 'improvement' | 'no change' | null = null,
): MannWhitneyResultsItem {
  return {
    direction_of_change: direction,
  } as unknown as MannWhitneyResultsItem;
}

// Creates a minimal fake Student-T subtest result for the Student-T specific
// tests. Only the two fields the hook cares about are set; pass overrides to
// change them.
function makeStudentTSubtest(
  overrides: Partial<Record<string, unknown>> = {},
): CompareResultsItem {
  return {
    is_regression: false,
    is_improvement: false,
    ...overrides,
  } as unknown as CompareResultsItem;
}

describe('useSubtestRegressionCount', () => {
  beforeEach(() => {
    window.history.replaceState(
      null,
      '',
      '/compare-results?baseRev=abc&baseRepo=mozilla-central&framework=1',
    );
  });

  it('returns null counts and is not loading when result has no subtests', () => {
    const result = { ...baseResult, has_subtests: false };
    const { result: hookResult } = renderHook(() =>
      useSubtestRegressionCount({
        result,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    expect(hookResult.current.counts).toBeNull();
    expect(hookResult.current.isLoading).toBe(false);
    expect(mockedFetchCompare).not.toHaveBeenCalled();
  });

  it('calls memoizedFetchSubtestsCompareResults with correct params for compareView', async () => {
    mockedFetchCompare.mockResolvedValue([]);

    renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    await waitFor(() => {
      expect(mockedFetchCompare).toHaveBeenCalledWith({
        baseRev: 'abc123',
        baseRepo: 'mozilla-central',
        newRev: 'def456',
        newRepo: 'mozilla-central',
        framework: 1,
        baseParentSignature: '100',
        newParentSignature: '200',
        replicates: false,
        testVersion: 'mann-whitney-u',
        silvermanKDEEnabled: false,
      });
    });
  });

  it('sets isLoading to true while fetch is in flight', async () => {
    let resolvePromise!: (value: MannWhitneyResultsItem[]) => void;
    mockedFetchCompare.mockReturnValue(
      new Promise<MannWhitneyResultsItem[]>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result: hookResult } = renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    expect(hookResult.current.isLoading).toBe(true);
    expect(hookResult.current.counts).toBeNull();

    await act(async () => {
      resolvePromise([]);
    });

    expect(hookResult.current.isLoading).toBe(false);
  });

  it('counts Mann-Whitney regressions and improvements correctly', async () => {
    mockedFetchCompare.mockResolvedValue([
      makeMannWhitneySubtest('regression'),
      makeMannWhitneySubtest('regression'),
      makeMannWhitneySubtest('improvement'),
      makeMannWhitneySubtest('no change'),
      makeMannWhitneySubtest(null),
    ]);

    const { result: hookResult } = renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    await waitFor(() => {
      expect(hookResult.current.counts).toEqual({
        regressionCount: 2,
        improvementCount: 1,
      });
      expect(hookResult.current.isLoading).toBe(false);
    });
  });

  it('counts Student-T regressions and improvements correctly', async () => {
    mockedFetchCompare.mockResolvedValue([
      makeStudentTSubtest({ is_regression: true }),
      makeStudentTSubtest({ is_regression: true }),
      makeStudentTSubtest({ is_improvement: true }),
      makeStudentTSubtest(),
    ]);

    const { result: hookResult } = renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'student-t',
      }),
    );

    await waitFor(() => {
      expect(hookResult.current.counts).toEqual({
        regressionCount: 2,
        improvementCount: 1,
      });
      expect(hookResult.current.isLoading).toBe(false);
    });
  });

  it('keeps counts null and clears isLoading when fetch fails', async () => {
    mockedFetchCompare.mockRejectedValue(new Error('Network error'));

    const { result: hookResult } = renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    await waitFor(() => {
      expect(hookResult.current.isLoading).toBe(false);
    });
    expect(hookResult.current.counts).toBeNull();
  });

  it('does not clear isLoading when a stale fetch error arrives after testVersion changes', async () => {
    let rejectStale!: (err: Error) => void;
    mockedFetchCompare
      .mockReturnValueOnce(
        new Promise<never>((_, reject) => {
          rejectStale = reject;
        }),
      )
      .mockResolvedValue([]);

    const { rerender, result: hookResult } = renderHook(
      ({ testVersion }: { testVersion: TestVersion }) =>
        useSubtestRegressionCount({
          result: baseResult,
          view: compareView,
          replicates: false,
          testVersion,
        }),
      { initialProps: { testVersion: 'student-t' as TestVersion } },
    );

    // Switch versions — cancels the first fetch, starts the second
    rerender({ testVersion: 'mann-whitney-u' });

    // New fetch resolves; hook should finish loading
    await waitFor(() => {
      expect(hookResult.current.isLoading).toBe(false);
    });

    // Now the stale student-t fetch rejects — should not touch isLoading
    await act(async () => {
      rejectStale(new Error('stale error'));
    });

    expect(hookResult.current.isLoading).toBe(false);
    expect(hookResult.current.counts).not.toBeNull();
  });

  it('passes silvermanKDEEnabled as true when the URL param is present', async () => {
    window.history.replaceState(
      null,
      '',
      '/compare-results?baseRev=abc&baseRepo=mozilla-central&framework=1&enable_silverman_kde',
    );
    mockedFetchCompare.mockResolvedValue([]);

    renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    await waitFor(() => {
      expect(mockedFetchCompare).toHaveBeenCalledWith(
        expect.objectContaining({ silvermanKDEEnabled: true }),
      );
    });
  });

  it('calls memoizedFetchSubtestsCompareOverTimeResults with interval from URL for compareOverTimeView', async () => {
    window.history.replaceState(
      null,
      '',
      '/compare-over-time-results?selectedTimeRange=86400&baseRepo=mozilla-central&framework=1',
    );
    mockedFetchCompareOverTime.mockResolvedValue([]);

    renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareOverTimeView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    await waitFor(() => {
      expect(mockedFetchCompareOverTime).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 86400,
          silvermanKDEEnabled: false,
        }),
      );
    });
    expect(mockedFetchCompare).not.toHaveBeenCalled();
  });

  it('re-fetches once when testVersion switches', async () => {
    mockedFetchCompare.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ testVersion }: { testVersion: TestVersion }) =>
        useSubtestRegressionCount({
          result: baseResult,
          view: compareView,
          replicates: false,
          testVersion,
        }),
      { initialProps: { testVersion: 'student-t' as TestVersion } },
    );

    await waitFor(() => {
      expect(mockedFetchCompare).toHaveBeenCalledTimes(1);
    });

    rerender({ testVersion: 'mann-whitney-u' });

    await waitFor(() => {
      expect(mockedFetchCompare).toHaveBeenCalledTimes(2);
    });
    expect(mockedFetchCompare).toHaveBeenLastCalledWith(
      expect.objectContaining({ testVersion: 'mann-whitney-u' }),
    );
  });

  it('does not re-fetch when result reference changes but identifying fields are stable', async () => {
    mockedFetchCompare.mockResolvedValue([]);

    const result1 = { ...baseResult };
    const result2 = { ...baseResult }; // same data, new object reference

    const { rerender, result: hookResult } = renderHook(
      ({ result }: { result: typeof baseResult }) =>
        useSubtestRegressionCount({
          result,
          view: compareView,
          replicates: false,
          testVersion: 'mann-whitney-u',
        }),
      { initialProps: { result: result1 } },
    );

    await waitFor(() => {
      expect(hookResult.current.isLoading).toBe(false);
    });
    expect(mockedFetchCompare).toHaveBeenCalledTimes(1);

    rerender({ result: result2 });

    expect(mockedFetchCompare).toHaveBeenCalledTimes(1);
  });

  it('does not update state after the component unmounts', async () => {
    let resolvePromise!: (value: MannWhitneyResultsItem[]) => void;
    mockedFetchCompare.mockReturnValue(
      new Promise<MannWhitneyResultsItem[]>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result: hookResult, unmount } = renderHook(() =>
      useSubtestRegressionCount({
        result: baseResult,
        view: compareView,
        replicates: false,
        testVersion: 'mann-whitney-u',
      }),
    );

    expect(hookResult.current.isLoading).toBe(true);
    unmount();

    await act(async () => {
      resolvePromise([makeMannWhitneySubtest('regression')]);
    });

    expect(hookResult.current.counts).toBeNull();
  });
});

// Tests for the caching behavior of memoizedFetchSubtestsCompareResults.
// jest.requireActual bypasses the module-level mock above so we exercise the
// real implementation against fetchMock (which is globally active).
describe('memoizedFetchSubtestsCompareResults', () => {
  const { memoizedFetchSubtestsCompareResults: realMemoized } =
    jest.requireActual<typeof import('../../logic/treeherder')>(
      '../../logic/treeherder',
    );

  const RESULTS_URL =
    'begin:https://treeherder.mozilla.org/api/perfcompare/results/';

  // The module-level cache persists across tests. A unique newRev per test
  // guarantees a fresh cache entry and prevents cross-test interference.
  let revCounter = 0;
  function makeParams() {
    return {
      baseRev: `cache-test-base-rev-${++revCounter}`,
      baseRepo: 'mozilla-central' as const,
      newRev: `cache-test-new-rev-${revCounter}`,
      newRepo: 'mozilla-central' as const,
      framework: 1 as const,
      baseParentSignature: '100',
      newParentSignature: '200',
      replicates: false,
    };
  }

  it('fetches from the API on first call and resolves with the results', async () => {
    const mockData = [{ test: 'subtest-1' }, { test: 'subtest-2' }];
    fetchMock.get(RESULTS_URL, mockData);

    const result = await realMemoized(makeParams());

    expect(result).toEqual(mockData);
  });

  it('returns the same promise for identical params (cache hit)', () => {
    fetchMock.get(RESULTS_URL, []);

    const params = makeParams();
    const promise1 = realMemoized(params);
    const promise2 = realMemoized(params);

    expect(promise1).toBe(promise2);
  });

  it('returns a new promise for different params (cache miss)', () => {
    fetchMock.get(RESULTS_URL, []);

    const promise1 = realMemoized(makeParams());
    const promise2 = realMemoized(makeParams());

    expect(promise1).not.toBe(promise2);
  });
});

// Tests for the caching behavior of memoizedFetchSubtestsCompareOverTimeResults.
// jest.requireActual bypasses the module-level mock above so we exercise the
// real implementation against fetchMock (which is globally active).
describe('memoizedFetchSubtestsCompareOverTimeResults', () => {
  const { memoizedFetchSubtestsCompareOverTimeResults: realMemoized } =
    jest.requireActual<typeof import('../../logic/treeherder')>(
      '../../logic/treeherder',
    );

  const RESULTS_URL =
    'begin:https://treeherder.mozilla.org/api/perfcompare/results/';

  // The module-level cache persists across tests. A unique newRev per test
  // guarantees a fresh cache entry and prevents cross-test interference.
  let revCounter = 0;
  function makeParams() {
    return {
      baseRepo: 'mozilla-central' as const,
      newRepo: 'mozilla-central' as const,
      newRev: `cache-test-rev-${++revCounter}`,
      framework: 1 as const,
      interval: 86400 as TimeRange['value'],
      baseParentSignature: '100',
      newParentSignature: '200',
      replicates: false,
    };
  }

  it('fetches from the API on first call and resolves with the results', async () => {
    const mockData = [{ test: 'subtest-1' }, { test: 'subtest-2' }];
    fetchMock.get(RESULTS_URL, mockData);

    const result = await realMemoized(makeParams());

    expect(result).toEqual(mockData);
  });

  it('returns the same promise for identical params (cache hit)', () => {
    fetchMock.get(RESULTS_URL, []);

    const params = makeParams();
    const promise1 = realMemoized(params);
    const promise2 = realMemoized(params);

    expect(promise1).toBe(promise2);
  });

  it('returns a new promise for different params (cache miss)', () => {
    fetchMock.get(RESULTS_URL, []);

    const promise1 = realMemoized(makeParams());
    const promise2 = realMemoized(makeParams());

    expect(promise1).not.toBe(promise2);
  });
});
