import { TableBody } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { themeMode } = props;

  const themeColor300 =
    themeMode == 'light' ? Colors.Background300 : Colors.Background300Dark;

  const styles = {
    tableBody: style({
      marginTop: Spacing.Large,
      borderSpacing: '0px 4px',
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
        '.revisionRow': {
          borderBottom: `${Spacing.Small}px solid ${themeColor300}`,
          backgroundColor: Colors.Background200,
          margin: '4px 0px',
        },
      },
    }),
  };
  return (
    <TableBody className={styles.tableBody}>
      <RevisionHeader />
      <RevisionRow themeMode={themeMode} />
      <RevisionRow themeMode={themeMode} />
      <RevisionRow themeMode={themeMode} />
    </TableBody>
  );
}

interface TableContentProps {
  themeMode: 'light' | 'dark';
}

export default TableContent;
