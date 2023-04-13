import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import { TableRow, TableCell, TableHead } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';

const styles = {
  headerRow: style({
    background: Colors.Background100,
    borderRadius: '4px',
    display: 'flex',
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
    fontWeight: 590,
    fontSize: '13px',
    lineHeight: '16px',
    flexDirection: 'row',
    maxWidth: '950px',
    padding: Spacing.Small,
    textAlign: 'center',
    $nest: {
      '.platform-header, .confidence-header': {
        width: '120px',
      },
      '.status-header': {
        width: '110px',
      },
      '.base-header, .new-header': {
        width: '85px',
      },
      '.MuiTableCell-root': {
        padding: 0,
        margin: 0,
        textAlign: 'center',
      },
    },
  }),

  filter: style({
    background: Colors.Background200,
    borderRadius: '4px',
    cursor: 'not-allowed',
    display: 'flex',
    gap: Spacing.Small,
    margin: Spacing.Small,
    padding: `${Spacing.Small}px ${Spacing.Small}px`,
    width: 'fit-content',
  }),
};
function TableHeader() {
  const headerCells = [
    {
      name: 'Platform',
      disable: true,
      filter: true,
      key: 'platform',
      sort: true,
    },
    {
      name: 'Base',
      key: 'base',
    },
    { key: 'comparisonSign' },
    { name: 'New', key: 'new' },
    {
      name: 'Status',
      disable: true,
      filter: true,
      key: 'status',
      sort: true,
    },
    {
      name: 'Delta(%)',
      key: 'delta',
    },
    {
      name: 'Confidence',
      disable: true,
      filter: true,
      key: 'confidence',
      sort: true,
    },
    { name: 'Total Runs', key: 'runs' },
    { colSpan: 4, key: 'empty' },
  ];
  return (
    <TableHead data-testid='table-header'>
      <TableRow className={styles.headerRow}>
        {headerCells.map((header) => (
          <TableCell
            key={`${header.key}`}
            className={`${header.key}-header`}
            colSpan={header.colSpan || undefined}
          >
            <div className={header.filter ? styles.filter : ''}>
              {header.sort ? <SortIcon /> : null}
              <span>{header.name}</span>
              {header.filter ? <ExpandMoreIcon /> : null}
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;
