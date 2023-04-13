import { TableBody } from '@mui/material';
import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

const styles = {
  tableBody: style({
    marginTop: Spacing.Large,
    $nest: {
      '.MuiTableCell-root': {
        padding: 0,
      },
      '.revision-header .MuiTableCell-root': {
        padding: 0,
        paddingTop: Spacing.Large,
        paddingBottom: Spacing.Small,
      },
      '.platform': {
        paddingLeft: Spacing.xLarge,
      },
    },
  }),
};

function TableContent() {
  return (
    <TableBody className={styles.tableBody}>
      <RevisionHeader />
      <RevisionRow />
      <RevisionRow />
      <RevisionRow />
    </TableBody>
  );
}

export default TableContent;
