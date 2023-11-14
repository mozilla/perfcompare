import { CompareResultsItem, Repository, RevisionsList } from '../types/state';

// This file contains functions to request the Treeherder API

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

type FetchProps = {
  baseRepo: Repository['name'];
  baseRev: string;
  newRepo: Repository['name'];
  newRev: string;
  framework: string; // expected values are the framework's ids (frameworks examples talos, awsy, mozperftest, browsertime, build_metrics)
};

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
    framework,
    interval: '86400',
    no_subtests: 'true',
  });

  const response = await fetch(
    `${treeherderBaseURL}/api/perfcompare/results/?${searchParams.toString()}`,
  );
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

  return response.json() as Promise<CompareResultsItem[]>;
}

export async function fetchFakeCompareResults(commitHash: string) {
  const module = (await import(`../mockData/${commitHash}`)) as {
    comparisonResults: CompareResultsItem[];
  };
  return module.comparisonResults;
}

export type RecentRevisionsParams = {
  repository: string;
  hash: string | undefined;
  author: string | undefined;
};

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

export async function fetchRecentRevisions(params: RecentRevisionsParams) {
  const url = computeUrlFromSearchTermAndRepository(params);
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

  const json = (await response.json()) as { results: RevisionsList[] };
  return json.results;
}
