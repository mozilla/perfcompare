import { Button } from '@mui/material';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { ButtonsLightRaw } from '../../../styles';
import { truncateHash } from '../../../utils/helpers';

const styles = {
  downloadButton: style({
    $nest: {
      '.MuiButtonBase-root': {
        ...ButtonsLightRaw.Secondary,
      },
    },
  }),
};

interface GroupedResults {
  [key: string]: ResultObject[];
}

interface ResultObject {
  header_name: string;
  new_rev: string;
}

function DownloadButton() {
  let fileName = 'perf-compare-all-revisions.json';
  const results = useAppSelector((state) => {
    if (state.comparison.activeComparison === 'All revisions') {
      return state.compareResults.data;
    } else {
      fileName = `perf-compare-${truncateHash(
        state.comparison.activeComparison,
      )}.json`;
      return {
        [state.comparison.activeComparison]:
          state.compareResults.data[state.comparison.activeComparison],
      };
    }
  });

  const formatDownloadData = (
    data: Record<string, ResultObject[]>,
  ): object[] => {
    const groupNames = Object.keys(data);
    const transformedGroups: object[] = [];

    groupNames.forEach((groupName) => {
      const groupedResults = data[groupName].reduce(
        (grouped: GroupedResults, result: ResultObject) => {
          if (!grouped[result.header_name]) {
            grouped[result.header_name] = [];
          }
          grouped[result.header_name].push(result);
          return grouped;
        },
        {},
      );

      const transformedGroupEntries = Object.keys(groupedResults).map(
        (header_name) => ({
          [`${header_name} ${truncateHash(
            groupedResults[header_name][0].new_rev,
          )}`]: groupedResults[header_name],
        }),
      );

      transformedGroups.push(...transformedGroupEntries);
    });
    return transformedGroups;
  };

  return (
    <div className={styles.downloadButton}>
      <Button
        disabled={!results}
        href={`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(formatDownloadData(results)),
        )}`}
        download={fileName}
      >
        Download JSON
      </Button>
    </div>
  );
}

export default DownloadButton;
