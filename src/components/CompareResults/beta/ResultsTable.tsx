import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';
import TableContent from './TableContent';
import TableHeader from './TableHeader';


const customStyles = {
  boxShadow: 'none',
};

function ResultsTable(props: ResultsTableProps) {
  const { themeMode } = props;

  const themeColor100 = themeMode === 'light' ? Colors.Background100 : Colors.Background100Dark;

  const styles = {
    tableContainer: style({
      backgroundColor: themeColor100,
      marginTop: Spacing.Large,
      $nest: {
        '.MuiTable-root': {
          borderSpacing: `0 ${Spacing.Small}px`,
          borderCollapse: 'separate',
        },
      },
    }),
  };

  return (
    <TableContainer
      component={Paper}
      className={styles.tableContainer}
      data-testid='results-table'
      sx={customStyles}
    >
      <Table>
        <TableHeader themeMode={themeMode} />
        <TableContent themeMode={themeMode} />
      </Table>
    </TableContainer>
  );
}
interface ResultsTableProps {
  themeMode: 'light' | 'dark';
}

export default ResultsTable;
