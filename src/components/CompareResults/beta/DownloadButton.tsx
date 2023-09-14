import React, { useState, useLayoutEffect } from 'react';

import { Button } from '@mui/material';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { selectStringifiedJsonResults } from '../../../reducers/ComparisonSlice';
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

function DownloadButton() {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const results = useAppSelector(selectStringifiedJsonResults);

  const fileName = useAppSelector((state) => {
    if (
      state.comparison.activeComparison ===
      Strings.components.comparisonRevisionDropdown.allRevisions
    ) {
      return 'perf-compare-all-revisions.json';
    } else {
      return `perf-compare-${truncateHash(
        state.comparison.activeComparison,
      )}.json`;
    }
  });
  useLayoutEffect(() => {
    if (results) {
      const blob = new Blob([results], { type: 'application/json' });
      const newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);

      return () => {
        URL.revokeObjectURL(newBlobUrl);
      };
    }
  }, [results]);
  return (
    <div className={styles.downloadButton}>
      <Button href={blobUrl ?? '#'} download={fileName}>
        Download JSON
      </Button>
    </div>
  );
}

export default React.memo(DownloadButton);
