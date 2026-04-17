import { useState, useEffect } from 'react';

import { compareView } from '../common/constants';
import type { compareOverTimeView } from '../common/constants';
import {
  fetchSubtestsCompareResults,
  fetchSubtestsCompareOverTimeResults,
} from '../logic/treeherder';
import type {
  CombinedResultsItemType,
  MannWhitneyResultsItem,
} from '../types/state';
import type { TestVersion, TimeRange } from '../types/types';

type SubtestCounts = {
  regressionCount: number;
  improvementCount: number;
};

// For a given block of results for a test, find
// every row that has subtests, fetch those subtests from the treeherder API,
// and return counts of regressions and improvements.
// counts is null when there are no rows with subtests.
// isLoading is true while the fetch is in flight.
export function useSubtestRegressionCount({
  results,
  view,
  replicates,
  testVersion,
}: {
  results: Array<[string, CombinedResultsItemType[]]>;
  view: typeof compareView | typeof compareOverTimeView;
  replicates: boolean;
  testVersion: TestVersion;
}): { counts: SubtestCounts | null; isLoading: boolean } {
  const [counts, setCounts] = useState<SubtestCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Collect every result row that has subtests across all revisions in this test block.
    const resultsWithSubtests: CombinedResultsItemType[] = [];
    for (const [, listOfResults] of results) {
      for (const result of listOfResults) {
        if (result.has_subtests) {
          resultsWithSubtests.push(result);
        }
      }
    }

    if (resultsWithSubtests.length === 0) {
      setCounts(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const searchParams = new URLSearchParams(location.search);
    const silvermanKDEEnabled = searchParams.has('enable_silverman_kde');

    let interval: TimeRange['value'] | null = null;
    if (view !== compareView) {
      const intervalStr = new URLSearchParams(location.search).get(
        'selectedTimeRange',
      );
      if (intervalStr !== null) {
        interval = Number(intervalStr) as TimeRange['value'];
      }
    }

    const fetchPromises = resultsWithSubtests.map((result) => {
      if (view === compareView) {
        return fetchSubtestsCompareResults({
          baseRev: result.base_rev,
          baseRepo: result.base_repository_name,
          newRev: result.new_rev,
          newRepo: result.new_repository_name,
          framework: result.framework_id,
          baseParentSignature: String(result.base_signature_id),
          newParentSignature: String(result.new_signature_id),
          replicates,
          testVersion,
          silvermanKDEEnabled,
        });
      } else {
        return fetchSubtestsCompareOverTimeResults({
          baseRepo: result.base_repository_name,
          newRepo: result.new_repository_name,
          newRev: result.new_rev,
          framework: result.framework_id,
          interval: interval as TimeRange['value'],
          baseParentSignature: String(result.base_signature_id),
          newParentSignature: String(result.new_signature_id),
          replicates,
          testVersion,
          silvermanKDEEnabled,
        });
      }
    });

    let cancelled = false;
    void Promise.all(fetchPromises)
      .then((allSubtestResults) => {
        if (cancelled) return;
        let regressionCount = 0;
        let improvementCount = 0;
        for (const subtestResults of allSubtestResults) {
          for (const subtestResult of subtestResults) {
            // MannWhitneyResultsItem has direction_of_change
            // CompareResultsItem (Student-T) uses is_regression/is_improvement instead.
            const mwResult = subtestResult as unknown as MannWhitneyResultsItem;
            if (mwResult.direction_of_change !== undefined) {
              if (mwResult.direction_of_change === 'regression')
                regressionCount++;
              else if (mwResult.direction_of_change === 'improvement')
                improvementCount++;
            } else {
              if (subtestResult.is_regression === true) regressionCount++;
              else if (subtestResult.is_improvement === true)
                improvementCount++;
            }
          }
        }
        setCounts({ regressionCount, improvementCount });
        setIsLoading(false);
      })
      .catch(() => {
        // Silently fail — the counts are supplementary information
        // and should not break the main results view.
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [results, view, replicates, testVersion]);

  return { counts, isLoading };
}
