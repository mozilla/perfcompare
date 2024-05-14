import { repoMap, frameworks, timeRanges } from '../../common/constants';
import {
  fetchCompareResults,
  fetchCompareOverTimeResults,
  fetchFakeCompareResults,
  fetchRecentRevisions,
} from '../../logic/treeherder';
import { Repository } from '../../types/state';
import { FakeCommitHash, Framework, TimeRange } from '../../types/types';

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
  baseRev,
  baseRepo,
  newRevs,
  newRepos,
  framework,
  interval,
}: {
  baseRev: string | null;
  baseRepo: Repository['name'] | null;
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: string | number | null;
  interval: string | number | null;
}): {
  baseRev: string;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
} {
  //check framework first for the case of compare over time component
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

  //check the new repos and revs first for the case of compare over time component

  if (newRevs.length !== newRepos.length) {
    throw new Error(
      'There should be as many "newRepo" parameters as there are "newRev" parameters.',
    );
  }

  //if interval is not null, return values for time range component
  if (interval !== null) {
    if (interval === null) {
      interval = 86400;
    }
    const intervalValue = +interval as TimeRange['value'];
    if (Number.isNaN(intervalValue)) {
      throw new Error(
        `The parameter interval should be a number, but it is "${interval}".`,
      );
    }

    const intervalText = timeRanges.find(
      (entry) => entry.value === intervalValue,
    )?.text;

    if (!intervalText) {
      throw new Error(
        `The parameter interval isn't a valid value: "${interval}".`,
      );
    }

    //baseRev is not needed for compare over time
    //so set it to newRev[0] to pass tsc linter
    return {
      baseRev: newRevs[0],
      baseRepo: newRepos[0],
      newRevs,
      newRepos,
      frameworkId,
      frameworkName,
      intervalText,
      intervalValue,
    };
  }

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

  if (!newRevs.length) {
    return {
      baseRev,
      baseRepo,
      newRevs: [baseRev],
      newRepos: [baseRepo],
      frameworkId,
      frameworkName,
      //default to these values to pass tsc linter
      intervalText: 'Last day',
      intervalValue: 86400,
    };
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
    intervalText: 'Last day',
    intervalValue: 86400,
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

//Compare over time results are fetched in a similar way to compare results.
// /logic/treeherder.ts for all the revs we need results for.
async function fetchCompareOverTimeResultsOnTreeherder({
  newRevs,
  newRepos,
  framework,
  interval,
}: {
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: Framework['id'];
  interval: TimeRange['value'];
}) {
  const promises = newRevs.map((newRev, i) =>
    fetchCompareOverTimeResults({
      newRev,
      newRepo: newRepos[i],
      framework,
      interval,
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
  const intervalFromUrl = url.searchParams.get('interval');

  const {
    baseRev,
    baseRepo,
    newRevs,
    newRepos,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
  } = checkValues({
    baseRev: baseRevFromUrl,
    baseRepo: baseRepoFromUrl,
    newRevs: newRevsFromUrl,
    newRepos: newReposFromUrl,
    framework: frameworkFromUrl,
    interval: intervalFromUrl,
  });

  const resultsPromise = fetchCompareResultsOnTreeherder({
    baseRev,
    baseRepo,
    newRevs,
    newRepos,
    framework: frameworkId,
  });

  const resultsTimePromise = fetchCompareOverTimeResultsOnTreeherder({
    newRevs,
    newRepos,
    framework: frameworkId,
    interval: intervalValue,
  });

  // For each of these requests, we get a list of 1 item because we request one
  // specific hash.
  // TODO what happens if there's no result?
  const baseRevInfoPromise = fetchRecentRevisions({
    repository: baseRepo,
    hash: baseRev,
  }).then((listOfRevisions) => listOfRevisions[0]);
  const newRevsInfoPromises = newRevs.map((newRev, i) =>
    fetchRecentRevisions({ repository: newRepos[i], hash: newRev }).then(
      (listOfRevisions) => listOfRevisions[0],
    ),
  );

  const [results, overTimeResults, baseRevInfo, ...newRevsInfo] =
    await Promise.all([
      resultsPromise,
      resultsTimePromise,
      baseRevInfoPromise,
      ...newRevsInfoPromises,
    ]);

  return {
    results,
    overTimeResults,
    baseRev,
    baseRevInfo,
    baseRepo,
    newRevs,
    newRevsInfo,
    newRepos,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
  };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
