import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import { TableRow, TableCell, TableHead } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import type { ThemeMode } from '../../types/state';

function TableHeader(props: TableHeaderProps) {
  const { themeMode } = props;
  const styles = {
    headerRow: style({
      background:
        themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark,
      borderRadius: '4px',
      // To be removed
      fontFamily: 'SF Pro',
      fontStyle: 'normal',
      fontWeight: 590,
      fontSize: '13px',
      lineHeight: '16px',
      // End to be removed
      flexDirection: 'row',
      maxWidth: '950px',
      padding: Spacing.Small,
      $nest: {
        '.platform-header, .confidence-header': {
          width: '120px',
        },
        '.status-header': {
          width: '110px',
        },
        '.base-header, .new-header, .delta-header': {
          width: '85px',
        },
        '.confidence-header': {
          width: '140px',
        },
        '.MuiTableCell-root.runs-header': {
          textAlign: 'left',
        },
        '.MuiTableCell-root': {
          borderBottom: 'none',
          padding: 0,
          margin: 0,
          textAlign: 'center',
        },
        '.MuiTableCell-root:first-child': {
          borderRadius: '4px 0 0 4px',
        },
        '.MuiTableCell-root:last-child': {
          borderRadius: '0 4px 4px 0',
        },
      },
    }),

    filter: style({
      background:
        themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark,
      borderRadius: '4px',
      cursor: 'not-allowed',
      display: 'flex',
      gap: Spacing.Small,
      margin: Spacing.Small,
      padding: `${Spacing.Small}px ${Spacing.Small}px`,
      width: 'fit-content',
    }),
  };

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

interface TableHeaderProps {
  themeMode: ThemeMode;
}

export default TableHeader;
