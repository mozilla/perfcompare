import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import TableHeader from './TableHeader';

const styles = {
  tableContainer: style({
    marginTop: Spacing.Large,
  }),
};

function ResultsTable(props: ResultsTableProps) {
  const { themeMode } = props;
  
  return (
    <TableContainer component={Paper} className={styles.tableContainer} data-testid='results-table'>
      <Table aria-label="collapsible table">
        <TableHeader themeMode={themeMode} />
        {/* TODO: Add table body */}
      </Table>
    </TableContainer>
  );
}

interface ResultsTableProps {
  themeMode: 'light' | 'dark';
}

export default ResultsTable;
