import { repoMap, frameworks } from '../../common/constants';
import {
  fetchCompareResults,
  fetchFakeCompareResults,
} from '../../logic/treeherder';
import { Repository } from '../../types/state';
import { FakeCommitHash, Framework } from '../../types/types';

// This function checks and sanitizes the input values, then call the treeherder
// API using the functions from /logic/treeherder.ts with the sanitized values.
async function checkValuesAndFetchCompareResultsOnTreeherder({
  baseRev,
  baseRepo,
  newRevs,
  newRepos,
  framework,
}: {
  baseRev: string | null;
  baseRepo: Repository['name'] | null;
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: string | number | null;
}) {
  if (baseRev === null) {
    throw new Error('The parameter baseRev is missing.');
  }

  if (baseRepo === null) {
    throw new Error('The parameter baseRepo is missing.');
  }

  const validRepoValues = Object.values(repoMap);
  if (!validRepoValues.includes(baseRepo)) {
    throw new Error(
      `The parameter baseRepo "${baseRepo}" should be one of ${validRepoValues.join(
        ', ',
      )}.`,
    );
  }

  if (framework === null) {
    framework = 1; // default to talos so that manually typing the URL is easier
  }

  const frameworkId = +framework as Framework['id'];
  if (Number.isNaN(frameworkId)) {
    throw new Error(
      `The parameter framework should be a number, but it is "${framework}".`,
    );
  }
  const frameworkEntry = frameworks.find((entry) => entry.id === frameworkId);

  if (!frameworkEntry) {
    throw new Error(
      `The parameter framework isn't a valid value: "${framework}".`,
    );
  }

  let promises;
  if (newRevs.length) {
    if (newRevs.length !== newRepos.length) {
      throw new Error(
        'There should be as many "newRepo" parameters as there are "newRev" parameters.',
      );
    }
    if (!newRepos.every((newRepo) => validRepoValues.includes(newRepo))) {
      throw new Error(
        `Every parameter newRepo "${newRepos.join(
          '", "',
        )}" should be one of ${validRepoValues.join(', ')}.`,
      );
    }

    promises = newRevs.map((newRev, i) =>
      fetchCompareResults({
        baseRev,
        baseRepo,
        newRev,
        newRepo: newRepos[i],
        framework: frameworkId,
      }),
    );
    return Promise.all(promises);
  }
  return [
    await fetchCompareResults({
      baseRev,
      baseRepo,
      newRev: baseRev,
      newRepo: baseRepo,
      framework: frameworkId,
    }),
  ];
}

const fakeCommitHashes: FakeCommitHash[] = [
  'bb6a5e451dace3b9c7be42d24c9272738d73e6db',
  '9d50665254899d8431813bdc04178e6006ce6d59',
  'a998c42399a8fcea623690bf65bef49de20535b4',
];

// This is essentially a glue to call the related function from
// /logic/treeherder.ts for all the revs we need results for.
async function fetchAllFakeCompareResults() {
  const promises = fakeCommitHashes.map((hash) =>
    fetchFakeCompareResults(hash),
  );
  return Promise.all(promises);
}

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-results path is requested.
// It uses the URL parameters as inputs, and returns all the fetched data to the
// React components through React Router's useLoaderData hook.
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const useFakeData = url.searchParams.has('fakedata');
  const baseRev = url.searchParams.get('baseRev');
  const baseRepo = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newRevs = url.searchParams.getAll('newRev');
  const newRepos = url.searchParams.getAll('newRepo') as Repository['name'][];
  const framework = url.searchParams.get('framework');

  let resultsForAllRevs;
  if (useFakeData) {
    resultsForAllRevs = await fetchAllFakeCompareResults();
  } else {
    resultsForAllRevs = await checkValuesAndFetchCompareResultsOnTreeherder({
      baseRev,
      baseRepo,
      newRevs,
      newRepos,
      framework,
    });
  }

  return {
    results: resultsForAllRevs,
    baseRev: baseRev as string,
    baseRepo: baseRepo as Repository['name'],
    newRevs,
    newRepos,
    framework,
  };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;