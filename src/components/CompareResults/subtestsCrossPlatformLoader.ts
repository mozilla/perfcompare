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

// baseParentSignature, newParentSignature and platform are repeated once per
// platform, in the same order. "platform" is only a label: if its count doesn't
// match, it's ignored and the platform comes from the fetched results.
function checkSignaturePairs(
  baseParentSignatures: string[],
  newParentSignatures: string[],
  platforms: string[],
): SignaturePair[] {
  if (!baseParentSignatures.length) {
    throw new Error('The parameter baseParentSignature is missing.');
  }

  if (!newParentSignatures.length) {
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
          `The parameters baseParentSignature and newParentSignature should be numbers, but one of them is "${signature}".`,
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

// Fetches the subtests of one test for each of its platforms. Platforms are
// fetched independently so that one failure only flags its own column.
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

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
    baseRev: url.searchParams.get('baseRev'),
    baseRepo: url.searchParams.get('baseRepo') as Repository['name'] | null,
    newRev: url.searchParams.get('newRev'),
    newRepo: url.searchParams.get('newRepo') as Repository['name'] | null,
    framework: url.searchParams.get('framework'),
    replicates: url.searchParams.has('replicates'),
    testVersion: (url.searchParams.get('test_version') ??
      MANN_WHITNEY_U) as TestVersion,
  });

  const pairs = checkSignaturePairs(
    url.searchParams.getAll('baseParentSignature'),
    url.searchParams.getAll('newParentSignature'),
    url.searchParams.getAll('platform'),
  );

  const results: Promise<PlatformSubtestResults[]> = Promise.allSettled(
    pairs.map((pair) =>
      // The cache key is a JSON.stringify of these params: keep their order in
      // sync with useSubtestRegressionCount to reuse the results page's fetches.
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
      const { platform, baseParentSignature, newParentSignature } =
        pairs[index];
      const fallbackPlatform = `signature ${baseParentSignature}`;
      if (outcome.status === 'rejected') {
        return {
          platform: platform || fallbackPlatform,
          baseParentSignature,
          newParentSignature,
          results: [],
          error: String(outcome.reason),
        };
      }
      return {
        platform: platform || outcome.value[0]?.platform || fallbackPlatform,
        baseParentSignature,
        newParentSignature,
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
    replicates,
    testVersion,
  };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
