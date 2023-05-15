import { TableRow, TableCell, Link } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';

const styles = {
  tagsOptions: style({
    textAlign: 'right',
    $nest: {
      'span:nth-child(3n)': {
        background: '#592ACB',
      },
      'span:nth-child(3n+1)': {
        background: '#005E5E',
      },
      'span:nth-child(3n+2)': {
        background: '#0250BB',
      },
    },
  }),
  chip: style({
    borderRadius: '4px',
    color: Colors.Background300,
    // To be removed
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: '8.2px',
    // End to be removed
    gap: Spacing.Small + 2,
    letterSpacing: '0.02em',
    marginLeft: Spacing.xSmall,
    padding: Spacing.xSmall,
    textAlign: 'center',
    textTransform: 'uppercase',
  }),
};

function RevisionHeader() {
  return (
    <TableRow className='revision-header'>
      <TableCell colSpan={8}>
        <strong>Metric 1</strong> <Link href='#'>0f9ef9ff3ea</Link>
      </TableCell>
      <TableCell colSpan={4}>
        <div className={styles.tagsOptions}>
          <span className={styles.chip}>e10s</span>
          <span className={styles.chip}>stylo</span>
          <span className={styles.chip}>fission</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default RevisionHeader;
