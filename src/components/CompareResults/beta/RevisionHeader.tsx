import { TableRow, TableCell, Link } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';

const styles = {
  tagsOptions: style({
    textAlign: 'right',
  }),
  chip: style({
    background: '#592ACB',
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
        Metric 1 <Link href='#'>0f9ef9ff3ea</Link>
      </TableCell>
      <TableCell colSpan={4}>
        <div className={styles.tagsOptions}>
          <span className={styles.chip}>tags</span>
          <span className={styles.chip}>tags</span>
          <span className={styles.chip}>tags</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default RevisionHeader;
