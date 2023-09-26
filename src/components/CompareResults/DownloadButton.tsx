import React from 'react';

import { Button } from '@mui/material';
import { style } from 'typestyle';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { selectStringifiedJsonResults } from '../../reducers/ComparisonSlice';
import { Strings } from '../../resources/Strings';
import { ButtonsLightRaw } from '../../styles';
import { truncateHash } from '../../utils/helpers';

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
  const results = useAppSelector(selectStringifiedJsonResults);

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
    if (results) {
      const blob = new Blob([results], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);

      // Trigger the download programmatically
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.click();

      // Clean up the URL object
      URL.revokeObjectURL(blobUrl);
    }
  };
  return (
    <div className={styles.downloadButton}>
      <Button onClick={handleDownloadClick}>Download JSON</Button>
    </div>
  );
}

export default React.memo(DownloadButton);
