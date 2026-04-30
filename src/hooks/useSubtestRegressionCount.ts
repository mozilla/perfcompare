import { useState, useEffect } from 'react';

import { compareView } from '../common/constants';
import type { compareOverTimeView } from '../common/constants';
import { getStrategy, type TestVersionStrategy } from '../common/testVersions';
import {
  memoizedFetchSubtestsCompareResults,
  memoizedFetchSubtestsCompareOverTimeResults,
} from '../logic/treeherder';
import type { CombinedResultsItemType } from '../types/state';
import type { TestVersion, TimeRange } from '../types/types';

type SubtestCounts = {
  regressionCount: number;
  improvementCount: number;
};

// For a single result row that has subtests, fetch those subtests from the
// treeherder API and return counts of regressions and improvements.
// counts is null when the row has no subtests.
// isLoading is true while the fetch is in flight.
export function useSubtestRegressionCount({
  result,
  view,
  replicates,
  testVersion,
}: {
  result: CombinedResultsItemType;
  view: typeof compareView | typeof compareOverTimeView;
  replicates: boolean;
  testVersion: TestVersion;
}): { counts: SubtestCounts | null; isLoading: boolean } {
  const [counts, setCounts] = useState<SubtestCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Destructure the fields so the effect only re-runs when
  // the actual API params change, not just because the parent passed a new
  // result object reference (e.g. after re-fetching with a different testVersion).
  const {
    has_subtests,
    base_rev,
    base_repository_name,
    new_rev,
    new_repository_name,
    framework_id,
    base_signature_id,
    new_signature_id,
  } = result;

  useEffect(() => {
    if (!has_subtests) {
      setCounts(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const searchParams = new URLSearchParams(location.search);
    const silvermanKDEEnabled = searchParams.has('enable_silverman_kde');
    let interval: TimeRange['value'] | null = null;
    if (view !== compareView) {
      const intervalStr = searchParams.get('selectedTimeRange');
      if (intervalStr !== null) {
        interval = Number(intervalStr) as TimeRange['value'];
      }
    }

    const fetchPromise: Promise<CombinedResultsItemType[]> =
      view === compareView
        ? (memoizedFetchSubtestsCompareResults({
            baseRev: base_rev,
            baseRepo: base_repository_name,
            newRev: new_rev,
            newRepo: new_repository_name,
            framework: framework_id,
            baseParentSignature: String(base_signature_id),
            newParentSignature: String(new_signature_id),
            replicates,
            testVersion,
            silvermanKDEEnabled,
          }) as Promise<CombinedResultsItemType[]>)
        : (memoizedFetchSubtestsCompareOverTimeResults({
            baseRepo: base_repository_name,
            newRepo: new_repository_name,
            newRev: new_rev,
            framework: framework_id,
            interval: interval as TimeRange['value'],
            baseParentSignature: String(base_signature_id),
            newParentSignature: String(new_signature_id),
            replicates,
            testVersion,
            silvermanKDEEnabled,
          }) as Promise<CombinedResultsItemType[]>);

    const strategy: TestVersionStrategy = getStrategy(testVersion);
    let cancelled = false;
    void fetchPromise
      .then((subtestResults) => {
        if (cancelled) return;
        let regressionCount = 0;
        let improvementCount = 0;
        for (const subtestResult of subtestResults) {
          if (strategy.isRegression(subtestResult)) regressionCount++;
          else if (strategy.isImprovement(subtestResult)) improvementCount++;
        }
        setCounts({ regressionCount, improvementCount });
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Silently fail — the counts are supplementary information
        // and should not break the main results view.
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    has_subtests,
    base_rev,
    base_repository_name,
    new_rev,
    new_repository_name,
    framework_id,
    base_signature_id,
    new_signature_id,
    view,
    replicates,
    testVersion,
  ]);

  return { counts, isLoading };
}
