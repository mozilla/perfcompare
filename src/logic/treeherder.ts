import moize from 'moize';

import { STUDENT_T } from '../common/constants';
import { JobInformation } from '../types/api';
import {
  CompareResultsItem,
  Repository,
  Changeset,
  HashToCommit,
} from '../types/state';
import { Framework, TestVersion, TimeRange } from '../types/types';

// This file contains functions to request the Treeherder API

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

type FetchProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  replicates: boolean;
  testVersion?: TestVersion;
};

type FetchOverTimeProps = {
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  interval: TimeRange['value'];
  replicates: boolean;
  testVersion?: TestVersion;
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
  testVersion?: TestVersion;
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
  testVersion?: string;
};

export async function fetchRevisionFromHash(
  basehash: string,
  basehashdate: string,
  newhash: string,
  newhashdate: string,
  repo: string,
  testVersion?: TestVersion,
) {
  const searchParams = new URLSearchParams({
    basehash: basehash,
    newhash: newhash,
    basehashdate: basehashdate,
    newhashdate: newhashdate,
    testVersion: testVersion ?? STUDENT_T,
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
  testVersion,
}: FetchProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    no_subtests: 'true',
    replicates: String(replicates),
    test_version: testVersion ?? STUDENT_T,
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
  testVersion,
}: FetchOverTimeProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: String(interval),
    no_subtests: 'true',
    replicates: String(replicates),
    test_version: testVersion ?? STUDENT_T,
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
  testVersion,
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
    test_version: testVersion ?? STUDENT_T,
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
  testVersion,
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
    test_version: testVersion ?? STUDENT_T,
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
