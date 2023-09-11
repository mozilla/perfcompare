import React, { useState, useEffect } from 'react';

import { Button } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { style } from 'typestyle';

import { RootState } from '../../../common/store';
import { useAppSelector } from '../../../hooks/app';
import { Strings } from '../../../resources/Strings';
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

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

  const selectComparison = (state: RootState) =>
    state.comparison.activeComparison;
  const selectData = (state: RootState) => state.compareResults.data;

  const resultsSelector = createSelector(
    selectComparison,
    selectData,
    (activeComparison, data) => {
      if (
        activeComparison ===
        Strings.components.comparisonRevisionDropdown.allRevisions
      ) {
        return JSON.stringify(formatDownloadData(data));
      } else {
        return JSON.stringify(
          formatDownloadData({
            [activeComparison]: data[activeComparison],
          }),
        );
      }
    },
  );

  const results = useAppSelector(resultsSelector);

  const fileNameSelector = createSelector(
    selectComparison,
    (activeComparison) => {
      if (
        activeComparison ===
        Strings.components.comparisonRevisionDropdown.allRevisions
      ) {
        return 'perf-compare-all-revisions.json';
      } else {
        return `perf-compare-${truncateHash(activeComparison)}.json`;
      }
    },
  );
  const fileName = useAppSelector(fileNameSelector);

  useEffect(() => {
    if (results) {
      const blob = new Blob([results], { type: 'application/json' });
      const newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);
    }
    return () => {
      URL.revokeObjectURL(blobUrl as string);
    };
  }, [results]);
  return (
    <div className={styles.downloadButton}>
      <Button
        disabled={blobUrl === null}
        href={blobUrl as string}
        download={fileName}
      >
        Download JSON
      </Button>
    </div>
  );
}

export default React.memo(DownloadButton);
