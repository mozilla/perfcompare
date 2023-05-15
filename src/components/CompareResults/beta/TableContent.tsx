import { TableBody } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { themeMode } = props;

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
        '.revisionRow': {
          backgroundColor: Colors.Background200,
          margin: `${Spacing.Small}px 0px`,
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
