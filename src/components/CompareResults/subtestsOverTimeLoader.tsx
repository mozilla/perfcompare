import { repoMap, frameworks, timeRanges } from '../../common/constants';
import {
  fetchSubtestsCompareOverTimeResults,
  getPerfherderSubtestsCompareOverTimeViewURL,
} from '../../logic/treeherder';
import { Repository } from '../../types/state';
import { Framework, TimeRange } from '../../types/types';

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
  baseRepo,
  newRev,
  newRepo,
  framework,
  interval,
  baseParentSignature,
  newParentSignature,
}: {
  baseRepo: Repository['name'] | null;
  newRev: string | null;
  newRepo: Repository['name'] | null;
  framework: string | number | null;
  interval: string | number | null;
  baseParentSignature: string | null;
  newParentSignature: string | null;
}): {
  baseRepo: Repository['name'];
  newRev: string;
  newRepo: Repository['name'];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  intervalValue: TimeRange['value'];
  intervalText: TimeRange['text'];
  baseParentSignature: string;
  newParentSignature: string;
} {
  if (baseRepo === null) {
    throw new Error('The parameter baseRepo is missing.');
  }

  if (newRev === null) {
    throw new Error('The parameter newRev is missing.');
  }

  if (newRepo === null) {
    throw new Error('The parameter newRepo is missing.');
  }

  const validRepoValues = Object.values(repoMap);
  if (!validRepoValues.includes(baseRepo)) {
    throw new Error(
      `The parameter baseRepo "${baseRepo}" should be one of ${validRepoValues.join(
        ', ',
      )}.`,
    );
  }
  if (!validRepoValues.includes(newRepo)) {
    throw new Error(
      `The parameter newRepo "${newRepo}" should be one of ${validRepoValues.join(
        ', ',
      )}.`,
    );
  }

  if (baseParentSignature === null) {
    throw new Error('The parameter baseParentSignature is missing.');
  }

  if (newParentSignature === null) {
    throw new Error('The parameter newParentSignature is missing.');
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

  if (interval === null) {
    throw new Error(
      'The parameter interval is missing. (Comparing over time results)',
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
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
    intervalText,
    intervalValue,
    baseParentSignature,
    newParentSignature,
  };
}

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-results path is requested.
// It uses the URL parameters as inputs, and returns all the fetched data to the
// React components through React Router's useLoaderData hook.
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newRevFromUrl = url.searchParams.get('newRev');
  const newRepoFromUrl = url.searchParams.get('newRepo') as
    | Repository['name']
    | null;
  const intervalFromUrl = url.searchParams.get('selectedTimeRange');
  const frameworkFromUrl = url.searchParams.get('framework');
  const baseParentSignatureFromUrl = url.searchParams.get(
    'baseParentSignature',
  );
  const newParentSignatureFromUrl = url.searchParams.get('newParentSignature');
  const replicates = url.searchParams.has('replicates');

  const {
    baseRepo,
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
    baseParentSignature,
    newParentSignature,
  } = checkValues({
    baseRepo: baseRepoFromUrl,
    newRev: newRevFromUrl,
    newRepo: newRepoFromUrl,
    framework: frameworkFromUrl,
    interval: intervalFromUrl,
    baseParentSignature: baseParentSignatureFromUrl,
    newParentSignature: newParentSignatureFromUrl,
  });

  const results = fetchSubtestsCompareOverTimeResults({
    baseRepo,
    newRev,
    newRepo,
    framework: frameworkId,
    interval: intervalValue,
    baseParentSignature,
    newParentSignature,
    replicates,
  });

  const subtestsViewPerfherderURL = getPerfherderSubtestsCompareOverTimeViewURL(
    baseRepo,
    newRepo,
    newRev,
    frameworkId,
    intervalValue,
    Number(baseParentSignature),
    Number(newParentSignature),
  );

  return {
    results,
    baseRepo,
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
    intervalValue,
    intervalText,
    baseParentSignature,
    newParentSignature,
    subtestsViewPerfherderURL,
    replicates,
  };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
