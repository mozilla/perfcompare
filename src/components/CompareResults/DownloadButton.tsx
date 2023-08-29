import { Button } from '@mui/material';
import { style } from 'typestyle';

import { ButtonsLightRaw } from '../../styles';

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
  return (
    <div className={styles.downloadButton}>
      <Button disabled>Download JSON</Button>
    </div>
  );
}

export default DownloadButton;
