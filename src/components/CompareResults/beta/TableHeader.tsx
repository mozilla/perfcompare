import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';

const styles = {
  tableHeader: style({
    alignItems: 'center',
    background: Colors.Background100,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '950px',
    padding: Spacing.Small,
  }),
  filter: style({
    background: Colors.Background200,
    borderRadius: '4px',
  }),
};
function TableHeader() {
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
    <TableHead className={styles.tableHeader} data-testid='table-header'>
      <TableRow>
        {headerCells.map((header) => (
          <TableCell key={header.name + 'header'} className={header.filter ? 'filter' : ''}>{header.name}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;
