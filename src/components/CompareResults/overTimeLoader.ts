import { parseFrameworkIds } from './loader';
import {
  repoMap,
  frameworks,
  timeRanges,
  compareOverTimeView,
  MANN_WHITNEY_U,
} from '../../common/constants';
import {
  memoizedFetchCompareOverTimeResults,
  memoizedFetchRevisionForRepository,
} from '../../logic/treeherder';
import {
  Changeset,
  CombinedResultsItemType,
  Repository,
} from '../../types/state';
import { Framework, TestVersion, TimeRange } from '../../types/types';

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
  baseRepo,
  newRevs,
  newRepos,
  frameworkValues,
  interval,
  replicates,
  testVersion,
}: {
  baseRepo: Repository['name'] | null;
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkValues: string[];
  interval: string | number | null;
  replicates: boolean;
  testVersion?: TestVersion | null;
}): {
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkIds: Framework['id'][];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
  replicates: boolean;
  testVersion: TestVersion;
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

  const frameworkIds = parseFrameworkIds(frameworkValues);

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

  if (testVersion === MANN_WHITNEY_U || testVersion === null) {
    replicates = true;
  }

  if (!testVersion) {
    testVersion = MANN_WHITNEY_U;
  }

  return {
    baseRepo,
    newRevs,
    newRepos,
    frameworkIds,
    intervalText,
    intervalValue,
    replicates,
    testVersion,
  };
}

//Compare over time results are fetched in a similar way to compare results.
// /logic/treeherder.ts for all the revs we need results for. Each framework
// is requested separately so that the server doesn't have to handle one giant
// request for all frameworks at once. The results of all frameworks are then
// merged per revision. Failures are tracked per framework so that the results
// of the frameworks that did load can still be displayed.
async function fetchCompareOverTimeResultsOnTreeherder({
  baseRepo,
  newRevs,
  newRepos,
  frameworkIds,
  interval,
  replicates,
  testVersion,
}: {
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkIds: Framework['id'][];
  interval: TimeRange['value'];
  replicates: boolean;
  testVersion: TestVersion;
}): Promise<{
  results: CombinedResultsItemType[][];
  failedFrameworkIds: Framework['id'][];
}> {
  const settledResults = await Promise.allSettled(
    frameworkIds.map((framework) =>
      Promise.all(
        newRevs.map((newRev, i) =>
          memoizedFetchCompareOverTimeResults({
            baseRepo,
            newRev,
            newRepo: newRepos[i],
            framework,
            interval,
            replicates,
            testVersion,
          }),
        ),
      ),
    ),
  );

  const results = newRevs.map(() => [] as CombinedResultsItemType[]);
  const failedFrameworkIds: Framework['id'][] = [];

  settledResults.forEach((settled, index) => {
    if (settled.status === 'fulfilled') {
      settled.value.forEach((revResults, revIndex) => {
        results[revIndex].push(...revResults);
      });
    } else {
      failedFrameworkIds.push(frameworkIds[index]);
    }
  });

  return { results, failedFrameworkIds };
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
  const frameworkFromUrl = url.searchParams.getAll('framework');
  const intervalFromUrl = url.searchParams.get('selectedTimeRange');
  const replicatesFromUrl = url.searchParams.has('replicates');
  const testVersionFromUrl = url.searchParams.get(
    'test_version',
  ) as TestVersion;

  const {
    baseRepo,
    newRevs,
    newRepos,
    frameworkIds,
    intervalValue,
    intervalText,
    replicates,
    testVersion,
  } = checkValues({
    baseRepo: baseRepoFromUrl,
    newRevs: newRevsFromUrl,
    newRepos: newReposFromUrl,
    frameworkValues: frameworkFromUrl,
    interval: intervalFromUrl,
    replicates: replicatesFromUrl,
    testVersion: testVersionFromUrl,
  });

  const fetchPromise = fetchCompareOverTimeResultsOnTreeherder({
    baseRepo,
    newRevs,
    newRepos,
    frameworkIds,
    interval: intervalValue,
    replicates,
    testVersion,
  });

  const resultsTimePromise = fetchPromise.then(({ results }) => results);
  const failedFrameworksPromise = fetchPromise.then(({ failedFrameworkIds }) =>
    failedFrameworkIds
      .map(
        (frameworkId) =>
          frameworks.find((framework) => framework.id === frameworkId)?.name,
      )
      .filter((name): name is Framework['name'] => name !== undefined),
  );

  const newRevsInfoPromises = newRevs.map((newRev, i) =>
    memoizedFetchRevisionForRepository({
      repository: newRepos[i],
      hash: newRev,
    }),
  );

  const newRevsInfo = await Promise.all(newRevsInfoPromises);

  return {
    results: resultsTimePromise,
    failedFrameworks: failedFrameworksPromise,
    baseRepo,
    newRevs,
    newRevsInfo,
    newRepos,
    frameworkIds,
    intervalValue,
    intervalText,
    view: compareOverTimeView,
    generation: generationCounter++,
    replicates,
    testVersion,
  };
}

type DeferredLoaderData = {
  results: Promise<CombinedResultsItemType[][]>;
  failedFrameworks: Promise<Framework['name'][]>;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRevsInfo: Changeset[];
  newRepos: Repository['name'][];
  frameworkIds: Framework['id'][];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
  view: typeof compareOverTimeView;
  generation: number;
  replicates: boolean;
  testVersion: TestVersion;
};

// Be explicit with the returned type to control it better than if we were
// inferring it.
export type LoaderReturnValue = DeferredLoaderData;
