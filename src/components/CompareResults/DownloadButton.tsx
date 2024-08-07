import { Button } from '@mui/material';
import { useAsyncValue } from 'react-router-dom';
import { style } from 'typestyle';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import { truncateHash } from '../../utils/helpers';

type ResultsGroupedByKey = Record<string, CompareResultsItem[]>;

/* This function transforms results into an array of objects, where each object
 * represents a array of objects grouped by their header_name as key. The keys
 * in the resulting objects are composed of header_name and a truncated hash of
 * new_rev. For example:
 *   [
 *     {
 *       "a11yr opt e10s fission stylo webrender 69d5beb77da0": [
 *         {
 *           "base_rev": "8f5a11c1eb0b7598d1415f6efa9c360191a423f8",
 *           "new_rev": "69d5beb77da06f9eda78eff3c54463273d457e66",
 *           "framework_id": 1,
 *           ...
 *         }
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 */
const formatDownloadData = (
  data: CompareResultsItem[],
): Array<ResultsGroupedByKey> => {
  const groupedResults = data.reduce((grouped, result) => {
    if (!grouped[result.header_name]) {
      grouped[result.header_name] = [];
    }
    grouped[result.header_name].push(result);
    return grouped;
  }, {} as ResultsGroupedByKey);

  const transformedGroups = Object.keys(groupedResults).map((header_name) => {
    const key = `${header_name} ${truncateHash(
      groupedResults[header_name][0].new_rev,
    )}`;
    const value = groupedResults[header_name];

    return {
      [key]: value,
    };
  });

  return transformedGroups;
};

function generateJsonDataFromComparisonResults(
  activeComparison: string,
  results: CompareResultsItem[][],
) {
  const resultsForCurrentComparison =
    activeComparison ===
    Strings.components.comparisonRevisionDropdown.allRevisions.key
      ? results.flat()
      : results.find((result) => result[0].new_rev === activeComparison) ?? [];
  return JSON.stringify(
    formatDownloadData(resultsForCurrentComparison),
    null,
    2,
  );
}

const styles = {
  downloadButton: style({
    height: '41px',
    flex: 'none',
    $nest: {
      '.MuiButtonBase-root': {
        height: '100%',
        width: '100%',
      },
    },
  }),
};

function DownloadButton() {
  const loaderData = useAsyncValue();
  const results = loaderData as CompareResultsItem[][];
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const fileName = useAppSelector((state: RootState) => {
    if (
      state.comparison.activeComparison ===
      Strings.components.comparisonRevisionDropdown.allRevisions.key
    ) {
      return 'perf-compare-all-revisions.json';
    } else {
      return `perf-compare-${truncateHash(
        state.comparison.activeComparison,
      )}.json`;
    }
  });

  const handleDownloadClick = () => {
    const processedResults = generateJsonDataFromComparisonResults(
      activeComparison,
      results,
    );
    const blob = new Blob([processedResults], {
      type: 'application/json',
    });
    const blobUrl = URL.createObjectURL(blob);

    // Trigger the download programmatically
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    downloadLink.click();

    // Clean up the URL object
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className={styles.downloadButton}>
      <Button
        variant='contained'
        color='secondary'
        onClick={handleDownloadClick}
      >
        Download JSON
      </Button>
    </div>
  );
}

export default DownloadButton;
