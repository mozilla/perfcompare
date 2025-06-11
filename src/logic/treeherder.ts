import moize from 'moize';

import { JobInformation } from '../types/api';
import {
  CompareResultsItem,
  Repository,
  Changeset,
  HashToCommit,
} from '../types/state';
import { Framework, TimeRange } from '../types/types';

// This file contains functions to request the Treeherder API

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

type FetchProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  replicates: boolean;
};

type FetchOverTimeProps = {
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  interval: TimeRange['value'];
  replicates: boolean;
};

type FetchSubtestsProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  baseParentSignature: string;
  newParentSignature: string;
  replicates: boolean;
};

type FetchSubtestsOverTimeProps = {
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  interval: TimeRange['value'];
  baseParentSignature: string;
  newParentSignature: string;
  replicates: boolean;
};

export async function fetchRevisionFromHash(
  basehash: string,
  basehashdate: string,
  newhash: string,
  newhashdate: string,
  repo: string,
) {
  const searchParams = new URLSearchParams({
    basehash: basehash,
    newhash: newhash,
    basehashdate: basehashdate,
    newhashdate: newhashdate,
  });
  const url = `${treeherderBaseURL}/api/project/${repo}/hash/tocommit/?${searchParams.toString()}`;
  const response = await fetchFromTreeherder(url);
  return response.json() as Promise<HashToCommit>;
}

async function fetchFromTreeherder(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        `Error when requesting treeherder: ${await response.text()}`,
      );
    } else {
      throw new Error(
        `Error when requesting treeherder: (${response.status}) ${response.statusText}`,
      );
    }
  }
  return response;
}
// This fetches the based on the hash inside the commit message of ./mach try perf pushed jobs

// This fetches data from the Treeherder API /api/perfcompare/results.
// This API returns the results of a comparison between 2 revisions.
export async function fetchCompareResults({
  baseRev,
  baseRepo,
  newRev,
  newRepo,
  framework,
  replicates,
}: FetchProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    no_subtests: 'true',
    replicates: String(replicates),
  });
  const url = `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`;
  const response = await fetchFromTreeherder(url);

  return response.json() as Promise<CompareResultsItem[]>;
}

// This API returns the results of compare over time between new revisions.
export async function fetchCompareOverTimeResults({
  baseRepo,
  newRev,
  newRepo,
  framework,
  interval,
  replicates,
}: FetchOverTimeProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: String(interval),
    no_subtests: 'true',
    replicates: String(replicates),
  });
  const url = `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`;
  const response = await fetchFromTreeherder(url);

  return response.json() as Promise<CompareResultsItem[]>;
}

// This API returns the subtests results of a particular comparison result between 2 revisions.
export async function fetchSubtestsCompareResults({
  baseRev,
  baseRepo,
  newRev,
  newRepo,
  framework,
  baseParentSignature,
  newParentSignature,
  replicates,
}: FetchSubtestsProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    base_parent_signature: baseParentSignature,
    new_parent_signature: newParentSignature,
    replicates: String(replicates),
  });

  const url = `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`;
  const response = await fetchFromTreeherder(url);

  return response.json() as Promise<CompareResultsItem[]>;
}

// This API returns the subtests results of a particular comparison result between 2 revisions.
export async function fetchSubtestsCompareOverTimeResults({
  baseRepo,
  newRev,
  newRepo,
  framework,
  interval,
  baseParentSignature,
  newParentSignature,
  replicates,
}: FetchSubtestsOverTimeProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: String(interval),
    base_parent_signature: baseParentSignature,
    new_parent_signature: newParentSignature,
    replicates: String(replicates),
  });

  const url = `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`;
  const response = await fetchFromTreeherder(url);

  return response.json() as Promise<CompareResultsItem[]>;
}

// This function returns fake comparison results from mock files.
export async function fetchFakeCompareResults(commitHash: string) {
  const module = (await import(`../mockData/${commitHash}`)) as {
    comparisonResults: CompareResultsItem[];
  };
  return module.comparisonResults;
}

export type RecentRevisionsParams = {
  repository: string;
  hash?: string | undefined;
  search?: string | undefined;
  author?: string | undefined;
};

// This computes the URL to the Treeherder API /api/project depending on whether
// we want to optionally filter by author or revision.
function computeUrlFromSearchTermAndRepository({
  repository,
  hash,
  search,
  author,
}: RecentRevisionsParams) {
  const baseUrl = `${treeherderBaseURL}/api/project/${repository}/push/`;

  if (author) {
    return baseUrl + '?author_contains=' + encodeURIComponent(author);
  }

  if (hash) {
    return baseUrl + '?revision=' + hash;
  }

  if (search) {
    return baseUrl + '?search=' + encodeURIComponent(search);
  }

  return baseUrl + '?hide_reviewbot_pushes=true&count=30';
}

// This fetches the recent revisions on a specific repository, optionally
// filtering by hash or author, using the Treeherder API /api/project.
export async function fetchRecentRevisions(params: RecentRevisionsParams) {
  const url = computeUrlFromSearchTermAndRepository(params);
  const response = await fetchFromTreeherder(url);

  const json = (await response.json()) as { results: Changeset[] };
  return json.results;
}

// This is a specialised version of fetchRecentRevisions dedicated to fetching
// information about one specific revision.
export async function fetchRevisionForRepository(opts: {
  repository: string;
  hash: string;
}) {
  // We get a list of 1 item because we request one specific hash.
  const listOfOneRevision = await fetchRecentRevisions(opts);
  return listOfOneRevision[0];
}

// The memoized version of fetchRecentRevisions.
// We picked an arbitrary number of 5: we need 4 for base + 3 revs, and added an
// extra one to allow moving back and worth with some options. It could be
// increased some more later if needed.
export const memoizedFetchRevisionForRepository = moize(
  fetchRevisionForRepository,
  { isPromise: true, isShallowEqual: true, maxSize: 5 },
) as typeof fetchRevisionForRepository;

export async function fetchJobInformationFromJobId(
  repo: string,
  jobId: number,
) {
  const url = `${treeherderBaseURL}/api/project/${repo}/jobs/${jobId}/`;
  const response = await fetchFromTreeherder(url);

  return (await response.json()) as JobInformation;
}

export async function fetchDecisionTaskIdFromPushId(
  repo: string,
  pushId: number,
) {
  const url = `${treeherderBaseURL}/api/project/${repo}/push/decisiontask/?push_ids=${pushId}`;
  const response = await fetchFromTreeherder(url);

  const json = (await response.json()) as Record<string, { id: string }>;
  const decisionTaskId = json[pushId]?.id;

  if (!decisionTaskId) {
    throw new Error(
      `Failing fetching decision Task id: ${JSON.stringify(json)}`,
    );
  }

  return decisionTaskId;
}

export function getPerfherderCompareWithBaseViewURL(
  originalProject: Repository['name'],
  originalRevision: Changeset['revision'],
  newProject: Repository['name'],
  newRevision: Changeset['revision'],
  framework: Framework['id'],
) {
  const searchParams = new URLSearchParams({
    originalProject: originalProject,
    originalRevision: originalRevision,
    newProject: newProject,
    newRevision: newRevision,
    framework: String(framework),
    page: '1',
  });
  return `${treeherderBaseURL}/perfherder/compare?${searchParams.toString()}`;
}

export function getPerfherderSubtestsCompareWithBaseViewURL(
  originalProject: Repository['name'],
  originalRevision: Changeset['revision'],
  newProject: Repository['name'],
  newRevision: Changeset['revision'],
  framework: Framework['id'],
  originalSignature: number,
  newSignature: number,
) {
  const searchParams = new URLSearchParams({
    originalProject: originalProject,
    originalRevision: originalRevision,
    newProject: newProject,
    newRevision: newRevision,
    framework: String(framework),
    originalSignature: String(originalSignature),
    newSignature: String(newSignature),
    page: '1',
  });
  return `${treeherderBaseURL}/perfherder/comparesubtest?${searchParams.toString()}`;
}

export function getPerfherderCompareOverTimeViewURL(
  originalProject: Repository['name'],
  newProject: Repository['name'],
  newRevision: Changeset['revision'],
  framework: Framework['id'],
  selectedTimeRange: TimeRange['value'],
) {
  const searchParams = new URLSearchParams({
    originalProject: originalProject,
    newProject: newProject,
    newRevision: newRevision,
    framework: String(framework),
    selectedTimeRange: String(selectedTimeRange),
    page: '1',
  });
  return `${treeherderBaseURL}/perfherder/compare?${searchParams.toString()}`;
}

export function getPerfherderSubtestsCompareOverTimeViewURL(
  originalProject: Repository['name'],
  newProject: Repository['name'],
  newRevision: Changeset['revision'],
  framework: Framework['id'],
  selectedTimeRange: TimeRange['value'],
  originalSignature: number,
  newSignature: number,
) {
  const searchParams = new URLSearchParams({
    originalProject: originalProject,
    newProject: newProject,
    newRevision: newRevision,
    framework: String(framework),
    selectedTimeRange: String(selectedTimeRange),
    originalSignature: String(originalSignature),
    newSignature: String(newSignature),
    page: '1',
  });
  return `${treeherderBaseURL}/perfherder/comparesubtest?${searchParams.toString()}`;
}
