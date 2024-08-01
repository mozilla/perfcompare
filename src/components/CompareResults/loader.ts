import { defer } from 'react-router-dom';

import { repoMap, frameworks } from '../../common/constants';
import { compareView } from '../../common/constants';
import {
  fetchCompareResults,
  fetchFakeCompareResults,
  memoizedFetchRevisionForRepository,
} from '../../logic/treeherder';
import { Changeset, Repository } from '../../types/state';
import { FakeCommitHash, Framework } from '../../types/types';

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
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
}): {
  baseRev: string;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
} {
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
  const frameworkName = frameworks.find(
    (entry) => entry.id === frameworkId,
  )?.name;

  if (!frameworkName) {
    throw new Error(
      `The parameter framework isn't a valid value: "${framework}".`,
    );
  }
  if (!newRevs.length) {
    return {
      baseRev,
      baseRepo,
      newRevs: [baseRev],
      newRepos: [baseRepo],
      frameworkId,
      frameworkName,
    };
  }

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

  return {
    baseRev,
    baseRepo,
    newRevs,
    newRepos,
    frameworkId,
    frameworkName,
  };
}

// This is essentially a glue to call the related function from
// /logic/treeherder.ts for all the revs we need results for.
async function fetchCompareResultsOnTreeherder({
  baseRev,
  baseRepo,
  newRevs,
  newRepos,
  framework,
}: {
  baseRev: string;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: Framework['id'];
}) {
  const promises = newRevs.map((newRev, i) =>
    fetchCompareResults({
      baseRev,
      baseRepo,
      newRev,
      newRepo: newRepos[i],
      framework,
    }),
  );
  return Promise.all(promises);
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
  if (useFakeData) {
    const results = await fetchAllFakeCompareResults();
    // They're all based on the same rev
    const baseRev = results[0][0].base_rev;
    // And the same repository
    const baseRepo = results[0][0].base_repository_name;

    const newRevs = fakeCommitHashes;
    const newRepos = results.map((result) => result[0].new_repository_name);
    const frameworkId = results[0][0].framework_id;
    const frameworkName =
      frameworks.find((entry) => entry.id === frameworkId)?.name ?? '';

    return {
      results,
      baseRev,
      baseRepo,
      newRevs,
      newRepos,
      frameworkId,
      frameworkName,
      view: compareView,
    };
  }

  const baseRevFromUrl = url.searchParams.get('baseRev');
  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newRevsFromUrl = url.searchParams.getAll('newRev');
  const newReposFromUrl = url.searchParams.getAll(
    'newRepo',
  ) as Repository['name'][];
  const frameworkFromUrl = url.searchParams.get('framework');

  const { baseRev, baseRepo, newRevs, newRepos, frameworkId, frameworkName } =
    checkValues({
      baseRev: baseRevFromUrl,
      baseRepo: baseRepoFromUrl,
      newRevs: newRevsFromUrl,
      newRepos: newReposFromUrl,
      framework: frameworkFromUrl,
    });

  const resultsPromise = fetchCompareResultsOnTreeherder({
    baseRev,
    baseRepo,
    newRevs,
    newRepos,
    framework: frameworkId,
  });

  // For each of these requests, we get a list of 1 item because we request one
  // specific hash.
  // TODO what happens if there's no result?
  const baseRevInfoPromise = memoizedFetchRevisionForRepository({
    repository: baseRepo,
    hash: baseRev,
  });
  const newRevsInfoPromises = newRevs.map((newRev, i) =>
    memoizedFetchRevisionForRepository({
      repository: newRepos[i],
      hash: newRev,
    }),
  );

  const [baseRevInfo, ...newRevsInfo] = await Promise.all([
    baseRevInfoPromise,
    ...newRevsInfoPromises,
  ]);

  return defer({
    results: resultsPromise,
    baseRev,
    baseRevInfo,
    baseRepo,
    newRevs,
    newRevsInfo,
    newRepos,
    frameworkId,
    frameworkName,
    view: compareView,
  });
}

type DeferredLoaderData = {
  results: Promise<unknown>;
  baseRev: string;
  baseRevInfo: Changeset;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRevsInfo: Changeset[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  view: string;
};

//had to be more explicit with the type because the defer
//function returns a an inaccessible type
export type LoaderReturnValue = DeferredLoaderData;
