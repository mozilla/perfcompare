import { checkCommonSubtestsValues } from './subtestsLoader';
import { MANN_WHITNEY_U } from '../../common/constants';
import { memoizedFetchSubtestsCompareResults } from '../../logic/treeherder';
import { Repository } from '../../types/state';
import { TestVersion } from '../../types/types';
import type { PlatformSubtestResults } from '../../utils/subtestMatrix';

type SignaturePair = {
  baseParentSignature: string;
  newParentSignature: string;
  platform: string;
};

// The three parameters below are repeated once per platform, in the same order,
// so that a single URL describes the whole test group. "platform" is only used
// as a label: if it isn't repeated as many times as the signatures (eg. someone
// hand-edited the URL), it is ignored and the platform is taken from the
// fetched results instead.
function checkSignaturePairs(
  baseParentSignatures: string[],
  newParentSignatures: string[],
  platforms: string[],
): SignaturePair[] {
  if (baseParentSignatures.length === 0) {
    throw new Error('The parameter baseParentSignature is missing.');
  }

  if (newParentSignatures.length === 0) {
    throw new Error('The parameter newParentSignature is missing.');
  }

  if (baseParentSignatures.length !== newParentSignatures.length) {
    throw new Error(
      'The parameters baseParentSignature and newParentSignature must be repeated the same number of times.',
    );
  }

  const usePlatforms = platforms.length === baseParentSignatures.length;

  return baseParentSignatures.map((baseParentSignature, index) => {
    const newParentSignature = newParentSignatures[index];
    for (const signature of [baseParentSignature, newParentSignature]) {
      if (signature === '' || Number.isNaN(Number(signature))) {
        throw new Error(
          `The parameters baseParentSignature and newParentSignature should be a number, but one of them is "${signature}".`,
        );
      }
    }

    return {
      baseParentSignature,
      newParentSignature,
      platform: usePlatforms ? platforms[index] : '',
    };
  });
}

// Fetches the subtests of one test group for every platform it ran on, so that
// the page can pivot them into a subtest × platform matrix. Each platform is
// fetched independently: one failing platform leaves an empty, flagged column
// rather than breaking the whole page.
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  const baseRevFromUrl = url.searchParams.get('baseRev');
  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newRevFromUrl = url.searchParams.get('newRev');
  const newRepoFromUrl = url.searchParams.get('newRepo') as
    | Repository['name']
    | null;
  const frameworkFromUrl = url.searchParams.get('framework');
  const replicatesFromUrl = url.searchParams.has('replicates');
  const testVersionFromUrl = (url.searchParams.get('test_version') ??
    MANN_WHITNEY_U) as TestVersion;

  const {
    baseRev,
    baseRepo,
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
    replicates,
    testVersion,
  } = checkCommonSubtestsValues({
    baseRev: baseRevFromUrl,
    baseRepo: baseRepoFromUrl,
    newRev: newRevFromUrl,
    newRepo: newRepoFromUrl,
    framework: frameworkFromUrl,
    replicates: replicatesFromUrl,
    testVersion: testVersionFromUrl,
  });

  const pairs = checkSignaturePairs(
    url.searchParams.getAll('baseParentSignature'),
    url.searchParams.getAll('newParentSignature'),
    url.searchParams.getAll('platform'),
  );

  const results: Promise<PlatformSubtestResults[]> = Promise.allSettled(
    pairs.map((pair) =>
      // Keep this property order in sync with useSubtestRegressionCount: the
      // memoization key is a JSON.stringify of this object, so a different
      // order means a needless second request for data the main results page
      // has often already fetched.
      memoizedFetchSubtestsCompareResults({
        baseRev,
        baseRepo,
        newRev,
        newRepo,
        framework: frameworkId,
        baseParentSignature: pair.baseParentSignature,
        newParentSignature: pair.newParentSignature,
        replicates,
        testVersion,
      }),
    ),
  ).then((settled) =>
    settled.map((outcome, index) => {
      const pair = pairs[index];
      if (outcome.status === 'rejected') {
        return {
          platform: pair.platform || `signature ${pair.baseParentSignature}`,
          baseParentSignature: pair.baseParentSignature,
          newParentSignature: pair.newParentSignature,
          results: [],
          error: String(outcome.reason),
        };
      }

      return {
        platform:
          pair.platform ||
          outcome.value[0]?.platform ||
          `signature ${pair.baseParentSignature}`,
        baseParentSignature: pair.baseParentSignature,
        newParentSignature: pair.newParentSignature,
        results: outcome.value,
      };
    }),
  );

  return {
    results,
    baseRev,
    baseRepo,
    newRev,
    newRepo,
    frameworkId,
    frameworkName,
    pairs,
    replicates,
    testVersion,
  };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
