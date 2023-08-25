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

function DownloadButton() {
  const results = useAppSelector((state) => {
    const { data } = state.compareResults;
    return data;
  });

  return (
    <div className={styles.downloadButton}>
      <Button
        href={`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(results),
        )}`}
        download='perf-compare.json'
      >
        Download JSON
      </Button>
    </div>
  );
}

export default DownloadButton;
