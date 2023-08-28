import { Button } from '@mui/material';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { ButtonsLightRaw } from '../../../styles';

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
  [key: string]: object[];
}

interface ResultObject {
  header_name: string;
}

function DownloadButton() {
  const results = useAppSelector((state) => {
    const { data } = state.compareResults;
    return data;
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
          [header_name]: groupedResults[header_name],
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
        download='perf-compare.json'
      >
        Download JSON
      </Button>
    </div>
  );
}

export default DownloadButton;
