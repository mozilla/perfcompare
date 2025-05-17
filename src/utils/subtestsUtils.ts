import { subtestsOverTimeView } from '../common/constants';
import {
  getPerfherderSubtestsCompareWithBaseViewURL,
  getPerfherderSubtestsCompareOverTimeViewURL,
} from '../logic/treeherder';
import type {
  CompareResultsItem,
  SubtestsRevisionsHeader,
} from '../types/state';
import type { TimeRange } from '../types/types';

type SubtestsResults = {
  key: string;
  // By construction, there should be only one item in the array. But if more
  // than one subtests share the same name, then there will be more than one item.
  // Can this happen? We're not sure.
  value: CompareResultsItem[];
};

export function getSubtestsHeaderAndPerfherderURL(
  results: CompareResultsItem[],
  view: string,
  intervalValue: TimeRange['value'] | undefined,
): {
  subtestsHeader: SubtestsRevisionsHeader;
  subtestsViewPerfherderURL?: string;
} {
  const subtestsHeader: SubtestsRevisionsHeader = {
    suite: results[0].suite,
    framework_id: results[0].framework_id,
    test: results[0].test,
    option_name: results[0].option_name,
    extra_options: results[0].extra_options,
    new_rev: results[0].new_rev,
    new_repo: results[0].new_repository_name,
    base_rev: results[0].base_rev,
    base_repo: results[0].base_repository_name,
    base_parent_signature: results[0].base_parent_signature,
    new_parent_signature: results[0].base_parent_signature,
    platform: results[0].platform,
  };

  let subtestsViewPerfherderURL;
  if (
    subtestsHeader.base_parent_signature !== null &&
    subtestsHeader.new_parent_signature !== null
  ) {
    if (view === subtestsOverTimeView) {
      subtestsViewPerfherderURL = getPerfherderSubtestsCompareOverTimeViewURL(
        subtestsHeader.base_repo,
        subtestsHeader.new_repo,
        subtestsHeader.new_rev,
        subtestsHeader.framework_id,
        intervalValue ?? 86400,
        subtestsHeader.base_parent_signature,
        subtestsHeader.new_parent_signature,
      );
    } else
      subtestsViewPerfherderURL = getPerfherderSubtestsCompareWithBaseViewURL(
        subtestsHeader.base_repo,
        subtestsHeader.base_rev,
        subtestsHeader.base_repo,
        subtestsHeader.new_rev,
        subtestsHeader.framework_id,
        subtestsHeader.base_parent_signature,
        subtestsHeader.new_parent_signature,
      );
  }

  return { subtestsHeader, subtestsViewPerfherderURL };
}

const stringComparisonCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

export function defaultSortFunction(
  resultA: CompareResultsItem,
  resultB: CompareResultsItem,
) {
  return stringComparisonCollator.compare(resultA.test, resultB.test);
}

export function resultMatchesSearchTerm(
  result: CompareResultsItem,
  searchTerm: string,
) {
  return result.test.toLowerCase().includes(searchTerm.toLowerCase());
}

export function processResults(results: CompareResultsItem[]) {
  const processedResults = new Map<string, CompareResultsItem[]>();
  results.forEach((result) => {
    const { header_name: header } = result;
    const processedResult = processedResults.get(header);
    if (processedResult) {
      processedResult.push(result);
    } else {
      processedResults.set(header, [result]);
    }
  });
  const restructuredResults: SubtestsResults[] = Array.from(
    processedResults,
    function ([rowIdentifier, result]) {
      return {
        key: rowIdentifier,
        value: result,
      };
    },
  );

  return restructuredResults;
}
