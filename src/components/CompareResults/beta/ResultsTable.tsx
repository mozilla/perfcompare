import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

const styles = {
  tableContainer: style({
    marginTop: Spacing.Large,
  }),
};

function ResultsTable() {
  return (
    <TableContainer component={Paper} className={styles.tableContainer} data-testid='results-table'>
      <Table>
        <TableHeader />
        {/* TODO: Add table body */}
        <TableContent />
      </Table>
    </TableContainer>
  );
}

export default ResultsTable;
