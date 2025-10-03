import { repoMap, frameworks } from '../../common/constants';
import { memoizedFetchRevisionForRepository } from '../../logic/treeherder';
import { Changeset, Repository } from '../../types/state';
import { Framework } from '../../types/types';
import { STUDENT_T } from '../../utils/helpers';

const DEFAULT_VALUES = {
  newRev: null,
  newRevInfo: null,
  newRepo: 'try' as Repository['name'],
  frameworkId: 1 as Framework['id'],
  frameworkName: 'talos' as Framework['name'],
  testVersion: STUDENT_T,
};

// This function checks and sanitizes the input values, then returns values that
// we can then use in the rest of the application.
function checkValues({
  newRev,
  newRepo,
  frameworkName,
}: {
  newRev: string | null;
  newRepo: Repository['name'] | null;
  frameworkName: Framework['name'] | null;
}): null | {
  newRev: string;
  newRepo: Repository['name'];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
} {
  if (newRev === null || newRepo === null) {
    return null;
  }

  const validRepoValues = Object.values(repoMap);
  if (!validRepoValues.includes(newRepo)) {
    console.warn(`The repository ${newRepo} wasn't found in our list.`);
    return null;
  }

  if (frameworkName === null) {
    frameworkName = DEFAULT_VALUES.frameworkName;
  }

  let frameworkId = frameworks.find(
    (entry) => entry.name === frameworkName,
  )?.id;

  if (frameworkId === undefined) {
    // Default to talos if the entry wasn't found.
    console.warn(
      `The framework entry for ${frameworkName} wasn't found, defaulting to talos.`,
    );
    frameworkId = DEFAULT_VALUES.frameworkId;
    frameworkName = DEFAULT_VALUES.frameworkName;
  }

  return {
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
  };
}

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-results path is requested.
// It uses the URL parameters as inputs, and returns all the fetched data to the
// React components through React Router's useLoaderData hook.
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const newRevFromUrl = url.searchParams.get('newRev');
  const newRepoFromUrl = url.searchParams.get('newRepo') as
    | Repository['name']
    | null;
  const frameworkFromUrl = url.searchParams.get('frameworkName') as
    | Framework['name']
    | null;

  const checkedValues = checkValues({
    newRev: newRevFromUrl,
    newRepo: newRepoFromUrl,
    frameworkName: frameworkFromUrl,
  });
  if (!checkedValues) {
    return DEFAULT_VALUES;
  }

  const { newRev, newRepo, frameworkId, frameworkName } = checkedValues;

  const newRevInfo = await memoizedFetchRevisionForRepository({
    repository: newRepo,
    hash: newRev,
  });

  const testVersionFromUrl = url.searchParams.get('test_version');
  const testVersion = testVersionFromUrl ?? STUDENT_T

  if (!newRevInfo) {
    // The search returned no result.
    return DEFAULT_VALUES;
  }

  return {
    newRev,
    newRevInfo,
    newRepo,
    frameworkId,
    frameworkName,
    testVersion
  };
}

// Be explicit with the returned type to control it better than if we were
// inferring it.
export type LoaderReturnValue = {
  newRev: string;
  newRevInfo: Changeset;
  newRepo: Repository['name'];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  testVersion: string,
};
