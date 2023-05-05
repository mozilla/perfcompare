import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';

function TableHeader(props: TableHeaderProps) {
  const { themeMode } = props;
  const styles = {
    headerRow: style({
      background:
        themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'row',
      maxWidth: '950px',
      padding: Spacing.Small,
    }),
    filter: style({
      background:
        themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark,
      borderRadius: '4px',
      cursor: 'not-allowed',
      display: 'flex',
      gap: Spacing.Small,
      padding: `${Spacing.Small}px ${Spacing.Medium}px`,
    }),
  };

  const headerCells = [
    {
      name: 'Platform',
      disable: true,
      filter: true,
      sort: true,
    },
    {
      name: 'Base',
    },
    { name: 'New' },
    {
      name: 'Status',
      disable: true,
      filter: true,
      sort: true,
    },
    {
      name: 'Delta(%)',
    },
    {
      name: 'Confidence',
      disable: true,
      filter: true,
      sort: true,
    },
    { name: 'Total Runs' },
  ];
  return (
    <TableHead data-testid='table-header'>
      <TableRow className={styles.headerRow}>
        {headerCells.map((header) => (
          <TableCell key={header.name + 'Header'}>
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
  themeMode: 'light' | 'dark';
}

export default TableHeader;
