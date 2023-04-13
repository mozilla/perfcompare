import AppleIcon from '@mui/icons-material/Apple';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, TableRow, TableCell } from '@mui/material';
import { style } from 'typestyle';

const styles = {
  revisionRow: style({
    $nest: {
      '.confidence': {
        textAlign: 'center',
      },
      '.comparison-sign': {
        textAlign: 'center',
      },
      '.delta': {
        textAlign: 'center',
      },
      '.expand-button-container': {
        textAlign: 'right',
      },
      '.new-value': {
        textAlign: 'center',
      },
      '.platform-container': {
        display: 'flex',
      },
      '.status': {
        textAlign: 'center',
      },
      'total-runs': {
        textAlign: 'center',
      },
    },
  }),
};

function RevisionRow() {
  return (
    <TableRow className={styles.revisionRow}>
      <TableCell className='platform'>
        <div className='platform-container'>
          <AppleIcon />
          <span>Apple</span>
        </div>
      </TableCell>
      <TableCell>771.39ms</TableCell>
      <TableCell className='comparison-sign'>&gt;</TableCell>
      <TableCell className='new-value'>771.39ms</TableCell>
      <TableCell className='status'>Improvement</TableCell>
      <TableCell className='delta'>2.5%</TableCell>
      <TableCell className='confidence'>High</TableCell>
      <TableCell>B:23 N:27</TableCell>
      <TableCell>
        <TimelineIcon />
      </TableCell>
      <TableCell>
        <FileDownloadOutlinedIcon />
      </TableCell>
      <TableCell className='total-runs'>
        <RefreshOutlinedIcon />
      </TableCell>
      <TableCell className='expand-button'>
        <div className='expand-button-container'>
          <IconButton
            aria-label='expand row'
            size='small'
            // onClick={() => setOpen(!open)}
          >
            <KeyboardArrowDownIcon />
            {/* {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} */}
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default RevisionRow;
