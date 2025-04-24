import { repoMap, frameworks } from '../../common/constants';
import { compareView } from '../../common/constants';
import {
  fetchCompareResults,
  fetchFakeCompareResults,
  memoizedFetchRevisionForRepository,
  fetchRevisionFromHash,
} from '../../logic/treeherder';
import { Changeset, CompareResultsItem, Repository } from '../../types/state';
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

// This counter is incremented for each call of the loader. This allows the
// components to know when a new load happened and use it in keys.
// Essentially a workaround to https://github.com/remix-run/react-router/issues/11864
let generationCounter = 0;

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
      generation: generationCounter++,
    };
  }
  const baseRevFromUrl = url.searchParams.get('baseRev');
  const newRevsFromUrl = url.searchParams.getAll('newRev');
  const baseHashFromUrl = url.searchParams.get('baseHash');
  const newHashFromUrl = url.searchParams.get('newHash');

  // This loader is the only one used by ./mach try perf, and due to
  // recent changes mach try perf can't get instant push links to try
  // when we push, we must attach a hash to the commit message and
  // search commits for that hash, and return the commit associated
  // with that hash and update the baseRev and newRev
  let baseRevsFromHash = baseRevFromUrl;
  let newRevsFromHash = newRevsFromUrl;
  let notUsingHashToFindRevisions = true;
  if (baseHashFromUrl && newHashFromUrl) {
    // Update to the boolean to indicate we are using a hash to find revisions
    notUsingHashToFindRevisions = false;
    const commits_from_hashes = await fetchRevisionFromHash(
      baseHashFromUrl,
      newHashFromUrl,
      'try',
    );
    baseRevsFromHash = commits_from_hashes.baseRevision;
    newRevsFromHash = [commits_from_hashes.newRevision];
    if (baseRevsFromHash == undefined || newRevsFromHash[0] == undefined) {
      throw new Error(
        'Unable to parse baseRev and/or newRev returned from treeherder',
      );
    }
  }

  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newReposFromUrl = url.searchParams.getAll(
    'newRepo',
  ) as Repository['name'][];
  const frameworkFromUrl = url.searchParams.get('framework');
  // Update baseRev and newRev if and only if we are supplied with newHash and baseHash
  const updateBaseRev = notUsingHashToFindRevisions
    ? baseRevFromUrl
    : baseRevsFromHash;
  const updateNewRev = notUsingHashToFindRevisions ? newRevsFromUrl : newRevsFromHash;

  const { baseRev, baseRepo, newRevs, newRepos, frameworkId, frameworkName } =
    checkValues({
      baseRev: updateBaseRev,
      baseRepo: baseRepoFromUrl,
      newRevs: updateNewRev,
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

  return {
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
    generation: generationCounter++,
  };
}

type DeferredLoaderData = {
  results: Promise<CompareResultsItem[][]>;
  baseRev: string;
  baseRevInfo: Changeset;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRevsInfo: Changeset[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  view: typeof compareView;
  generation: number;
};

// Be explicit with the returned type to control it better than if we were
// inferring it.
export type LoaderReturnValue = DeferredLoaderData;
