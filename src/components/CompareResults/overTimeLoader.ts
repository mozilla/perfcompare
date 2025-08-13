import {
  repoMap,
  frameworks,
  timeRanges,
  compareOverTimeView,
} from '../../common/constants';
import {
  fetchCompareOverTimeResults,
  memoizedFetchRevisionForRepository,
} from '../../logic/treeherder';
import { Changeset, CompareResultsItem, Repository } from '../../types/state';
import { Framework, TimeRange } from '../../types/types';

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
  baseRepo,
  newRevs,
  newRepos,
  framework,
  interval,
}: {
  baseRepo: Repository['name'] | null;
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: string | number | null;
  interval: string | number | null;
}): {
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
} {
  if (baseRepo === null) {
    throw new Error('The parameter baseRepo is missing.');
  }

  if (newRevs.length !== newRepos.length) {
    throw new Error(
      'There should be as many "newRepo" parameters as there are "newRev" parameters.',
    );
  }

  const validRepoValues = Object.values(repoMap);

  if (!newRepos.every((newRepo) => validRepoValues.includes(newRepo))) {
    throw new Error(
      `Every parameter newRepo "${newRepos.join(
        '", "',
      )}" should be one of ${validRepoValues.join(', ')}.`,
    );
  }

  if (interval === null) {
    throw new Error('The parameter interval is missing.');
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

  return {
    baseRepo,
    newRevs,
    newRepos,
    frameworkId,
    frameworkName,
    intervalText,
    intervalValue,
  };
}

//Compare over time results are fetched in a similar way to compare results.
// /logic/treeherder.ts for all the revs we need results for.
async function fetchCompareOverTimeResultsOnTreeherder({
  baseRepo,
  newRevs,
  newRepos,
  framework,
  interval,
  replicates,
}: {
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  framework: Framework['id'];
  interval: TimeRange['value'];
  replicates: boolean;
}) {
  const promises = newRevs.map((newRev, i) =>
    fetchCompareOverTimeResults({
      baseRepo,
      newRev,
      newRepo: newRepos[i],
      framework,
      interval,
      replicates,
    }),
  );
  return Promise.all(promises);
}

// This counter is incremented for each call of the loader. This allows the
// components to know when a new load happened and use it in keys.
// Essentially a workaround to https://github.com/remix-run/react-router/issues/11864
let generationCounter = 0;

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-over-time-results path is requested.
// It uses the URL parameters as inputs, and returns all the fetched data to the
// React components through React Router's useLoaderData hook.
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  //removed fakeData and fetchAllFakeCompareResults until one
  //for compareTime is created
  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newRevsFromUrl = url.searchParams.getAll('newRev');
  const newReposFromUrl = url.searchParams.getAll(
    'newRepo',
  ) as Repository['name'][];
  const frameworkFromUrl = url.searchParams.get('framework');
  const intervalFromUrl = url.searchParams.get('selectedTimeRange');
  const replicates = url.searchParams.has('replicates');

  const {
    baseRepo,
    newRevs,
    newRepos,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
  } = checkValues({
    baseRepo: baseRepoFromUrl,
    newRevs: newRevsFromUrl,
    newRepos: newReposFromUrl,
    framework: frameworkFromUrl,
    interval: intervalFromUrl,
  });

  const resultsTimePromise = fetchCompareOverTimeResultsOnTreeherder({
    baseRepo,
    newRevs,
    newRepos,
    framework: frameworkId,
    interval: intervalValue,
    replicates,
  });

  const newRevsInfoPromises = newRevs.map((newRev, i) =>
    memoizedFetchRevisionForRepository({
      repository: newRepos[i],
      hash: newRev,
    }),
  );

  const newRevsInfo = await Promise.all(newRevsInfoPromises);

  return {
    results: resultsTimePromise,
    baseRepo,
    newRevs,
    newRevsInfo,
    newRepos,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
    view: compareOverTimeView,
    generation: generationCounter++,
    replicates,
  };
}

type DeferredLoaderData = {
  results: Promise<CompareResultsItem[][]>;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRevsInfo: Changeset[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
  view: typeof compareOverTimeView;
  generation: number;
  replicates: boolean;
};

// Be explicit with the returned type to control it better than if we were
// inferring it.
export type LoaderReturnValue = DeferredLoaderData;
