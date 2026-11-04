import fetchMock from '@fetch-mock/jest';

import { loader } from '../components/CompareResults/loader';
import { fakeTreeherderFetch } from '../logic/fakeTreeherder';
import { fakeDefaultComparison } from '../logic/fakeTreeherderDefaults';
import {
  fetchCompareResults,
  fetchRevisionForRepository,
  isFakeTreeherderEnabled,
  preserveFakeDataParam,
  syncTreeherderBackendWithUrl,
  withTreeherderBackend,
} from '../logic/treeherder';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../types/state';
import type { ConfidenceText } from '../types/types';

const { baseRev, baseRepo, newRevs, newRepos } = fakeDefaultComparison;

function resultsUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepos[0],
    new_revision: newRevs[0],
    framework: '1',
    replicates: 'true',
    test_version: 'mann-whitney-u',
    ...params,
  });
  return `https://treeherder.mozilla.org/api/perfcompare/results/?${searchParams.toString()}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fakeTreeherderFetch(url);
  return (await response.json()) as T;
}

describe('Fake Treeherder backend', () => {
  beforeEach(() => {
    // The fake backend waits a bit to mimic the network.
    jest.useRealTimers();
  });

  afterEach(() => {
    syncTreeherderBackendWithUrl(new URL('https://perf.compare/'));
  });

  it('returns many Mann-Whitney U results across tests and platforms', async () => {
    const results = await fetchJson<MannWhitneyResultsItem[]>(resultsUrl({}));

    expect(results.length).toBeGreaterThan(30);
    expect(new Set(results.map((r) => r.header_name)).size).toBeGreaterThan(5);
    expect(new Set(results.map((r) => r.platform)).size).toBeGreaterThan(2);
    expect(results.some((r) => r.has_subtests)).toBe(true);

    // The filters and sorts have a variety of values to work with.
    const directions = new Set(results.map((r) => r.direction_of_change));
    expect(directions).toEqual(
      new Set(['no change', 'improvement', 'regression']),
    );
    const significance = new Set(
      results.map((r) => r.mann_whitney_test?.interpretation),
    );
    expect(significance).toEqual(new Set(['significant', 'not significant']));
    expect(
      new Set(results.map((r) => r.cliffs_interpretation)).size,
    ).toBeGreaterThan(2);

    for (const result of results) {
      expect(result.base_rev).toBe(baseRev);
      expect(result.new_rev).toBe(newRevs[0]);
      expect(Math.abs(result.cliffs_delta)).toBeLessThanOrEqual(1);
      expect(result.cles?.cles).toBeGreaterThanOrEqual(0);
      expect(result.cles?.cles).toBeLessThanOrEqual(1);
    }

    // Replicates are returned for the graphs.
    const talosResult = results.find((r) => r.suite === 'a11yr');
    expect(talosResult?.base_runs_replicates.length).toBeGreaterThan(
      talosResult?.base_runs.length ?? 0,
    );
  });

  it('returns Student-T results without replicates when not requested', async () => {
    const results = await fetchJson<CompareResultsItem[]>(
      resultsUrl({ test_version: 'student-t', replicates: 'false' }),
    );

    expect(results.length).toBeGreaterThan(30);
    expect(results.every((r) => r.base_runs_replicates.length === 0)).toBe(
      true,
    );
    const confidences = new Set(results.map((r) => r.confidence_text));
    for (const confidence of ['Low', 'Medium', 'High']) {
      expect(confidences.has(confidence as ConfidenceText)).toBe(true);
    }
  });

  it('is deterministic', async () => {
    const first = await fetchJson<unknown>(resultsUrl({ framework: '13' }));
    const second = await fetchJson<unknown>(resultsUrl({ framework: '13' }));
    expect(second).toEqual(first);
  });

  it('keeps the base values consistent across new revisions', async () => {
    const [first, second] = await Promise.all(
      newRevs
        .slice(0, 2)
        .map((newRev) =>
          fetchJson<CompareResultsItem[]>(
            resultsUrl({ new_revision: newRev, new_repository: 'try' }),
          ),
        ),
    );
    expect(second.map((r) => r.base_runs)).toEqual(
      first.map((r) => r.base_runs),
    );
    expect(second.map((r) => r.new_runs)).not.toEqual(
      first.map((r) => r.new_runs),
    );
  });

  it('returns the subtests of a result', async () => {
    const results = await fetchJson<CompareResultsItem[]>(
      resultsUrl({ framework: '13' }),
    );
    const parent = results.find((r) => r.has_subtests) as CompareResultsItem;

    const subtests = await fetchJson<CompareResultsItem[]>(
      resultsUrl({
        framework: '13',
        base_parent_signature: String(parent.base_signature_id),
        new_parent_signature: String(parent.new_signature_id),
      }),
    );

    expect(subtests.length).toBeGreaterThan(1);
    for (const subtest of subtests) {
      expect(subtest.suite).toBe(parent.suite);
      expect(subtest.platform).toBe(parent.platform);
      expect(subtest.base_parent_signature).toBe(parent.base_signature_id);
      expect(subtest.has_subtests).toBe(false);
    }
  });

  it('returns revision details, including the try_task_config commit for try', async () => {
    const { results } = await fetchJson<{
      results: Array<{ revision: string; revisions: unknown[] }>;
    }>(
      `https://treeherder.mozilla.org/api/project/try/push/?revision=${newRevs[0]}`,
    );
    expect(results).toHaveLength(1);
    expect(results[0].revision).toBe(newRevs[0]);
    expect(results[0].revisions).toHaveLength(2);
  });

  it('returns a list of recent pushes that can be searched', async () => {
    const { results } = await fetchJson<{ results: unknown[] }>(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true&count=30',
    );
    expect(results).toHaveLength(30);

    const { results: searched } = await fetchJson<{ results: unknown[] }>(
      `https://treeherder.mozilla.org/api/project/try/push/?search=${newRevs[0].slice(0, 12)}`,
    );
    expect(searched).toHaveLength(1);
  });

  it('refuses retrigger requests', async () => {
    const response = await fakeTreeherderFetch(
      'https://treeherder.mozilla.org/api/project/try/jobs/12345/',
    );
    expect(response.status).toBe(400);
  });

  it('is used instead of the real Treeherder when the URL has fakedata', async () => {
    syncTreeherderBackendWithUrl(
      new URL('https://perf.compare/compare-results?fakedata'),
    );
    expect(isFakeTreeherderEnabled()).toBe(true);

    const results = await fetchCompareResults({
      baseRev,
      baseRepo,
      newRev: newRevs[0],
      newRepo: newRepos[0],
      framework: 1,
      replicates: false,
    });
    expect(results.length).toBeGreaterThan(30);
    const revision = await fetchRevisionForRepository({
      repository: 'try',
      hash: newRevs[0],
    });
    expect(revision.revision).toBe(newRevs[0]);
    expect(fetchMock).not.toHaveFetched();

    syncTreeherderBackendWithUrl(new URL('https://perf.compare/'));
    expect(isFakeTreeherderEnabled()).toBe(false);
  });

  it('withTreeherderBackend selects the backend before running the loader', () => {
    const wrappedLoader = withTreeherderBackend(() =>
      isFakeTreeherderEnabled(),
    );
    expect(
      wrappedLoader({
        request: new Request('https://perf.compare/compare-results?fakedata'),
      }),
    ).toBe(true);
    expect(
      wrappedLoader({
        request: new Request('https://perf.compare/compare-results'),
      }),
    ).toBe(false);
  });

  it('preserveFakeDataParam only adds the parameter with the fake backend', () => {
    expect(preserveFakeDataParam(new URLSearchParams('a=1')).toString()).toBe(
      'a=1',
    );
    syncTreeherderBackendWithUrl(new URL('https://perf.compare/?fakedata'));
    expect(preserveFakeDataParam(new URLSearchParams('a=1')).toString()).toBe(
      'a=1&fakedata=',
    );
  });

  it('redirects /compare-results?fakedata to the default fake comparison', async () => {
    const response = (await loader({
      request: new Request('https://perf.compare/compare-results?fakedata'),
    })) as Response;

    expect(response.status).toBe(302);
    const location = new URL(
      response.headers.get('Location') as string,
      'https://perf.compare',
    );
    expect(location.pathname).toBe('/compare-results');
    expect(location.searchParams.has('fakedata')).toBe(true);
    expect(location.searchParams.get('baseRev')).toBe(baseRev);
    expect(location.searchParams.getAll('newRev')).toEqual(newRevs);
    expect(location.searchParams.getAll('newRepo')).toEqual(newRepos);
    expect(location.searchParams.getAll('framework')).toEqual(['1', '13']);
  });
});
