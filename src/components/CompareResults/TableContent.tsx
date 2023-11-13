import { TableBody } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { results, header } = props;

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
      <RevisionHeader header={header} />
      {results.length > 0 &&
        results.map((result, index) => (
          <RevisionRow key={index} result={result} />
        ))}
    </TableBody>
  );
}

interface TableContentProps {
  results: CompareResultsItem[];
  header: RevisionsHeader;
}

export default TableContent;
