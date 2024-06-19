import { JobInformation } from '../types/api';
import { CompareResultsItem, Repository, Changeset } from '../types/state';
import { Framework, TimeRange } from '../types/types';

// This file contains functions to request the Treeherder API

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

type FetchProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
};

type FetchOverTimeProps = {
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  interval: TimeRange['value'];
};

type FetchSubtestsProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  parentSignature: string;
};

type FetchSubtestsOverTimeProps = {
  baseRepo: Repository['name'];
  newRepo: Repository['name'];
  newRev: string;
  framework: Framework['id'];
  interval: TimeRange['value'];
  parentSignature: string;
};

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

// This fetches data from the Treeherder API /api/perfcompare/results.
// This API returns the results of a comparison between 2 revisions.
export async function fetchCompareResults({
  baseRev,
  baseRepo,
  newRev,
  newRepo,
  framework,
}: FetchProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: '86400',
    no_subtests: 'true',
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
}: FetchOverTimeProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: String(interval),
    no_subtests: 'true',
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
  parentSignature,
}: FetchSubtestsProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    base_revision: baseRev,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    parent_signature: parentSignature,
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
  parentSignature,
}: FetchSubtestsOverTimeProps) {
  const searchParams = new URLSearchParams({
    base_repository: baseRepo,
    new_repository: newRepo,
    new_revision: newRev,
    framework: String(framework),
    interval: String(interval),
    parent_signature: parentSignature,
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
  author?: string | undefined;
};

// This computes the URL to the Treeherder API /api/project depending on whether
// we want to optionally filter by author or revision.
function computeUrlFromSearchTermAndRepository({
  repository,
  hash,
  author,
}: RecentRevisionsParams) {
  const baseUrl = `${treeherderBaseURL}/api/project/${repository}/push/`;

  if (author) {
    return baseUrl + '?author=' + encodeURIComponent(author);
  }

  if (hash) {
    return baseUrl + '?revision=' + hash;
  }

  return baseUrl + '?hide_reviewbot_pushes=true';
}

// This fetches the recent revisions on a specific repository, optionally
// filtering by hash or author, using the Treeherder API /api/project.
export async function fetchRecentRevisions(params: RecentRevisionsParams) {
  const url = computeUrlFromSearchTermAndRepository(params);
  const response = await fetchFromTreeherder(url);

  const json = (await response.json()) as { results: Changeset[] };
  return json.results;
}

export async function fetchJobInformationFromJobId(
  repo: string,
  jobId: number,
) {
  const url = `${treeherderBaseURL}/api/project/${repo}/jobs/${jobId}`;
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
  const decisionTask = json[pushId]?.id;

  if (!decisionTask) {
    throw new Error(
      `Failing fetching decision Task id: ${JSON.stringify(json)}`,
    );
  }

  return decisionTask;
}
