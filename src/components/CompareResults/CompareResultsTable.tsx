import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useAppSelector } from '../../hooks/app';
import type { CompareResultsState } from '../../types/state';
import type { CompareResultsTableHeaders } from '../../types/types';
import PaginatedCompareResults from './PaginatedCompareResults';

const tableHeaders: CompareResultsTableHeaders[] = [
  { id: 'platform', label: 'Platform', align: 'center' },
  { id: 'graph', label: 'Graph', align: 'center' },
  { id: 'test-name', label: 'Test Name', align: 'left' },
  { id: 'base-value', label: 'Base', align: 'center' },
  { id: 'new-value', label: 'New', align: 'center' },
  { id: 'delta-percent', label: 'Delta', align: 'center' },
  { id: 'confidence', label: 'Confidence', align: 'center' },
  { id: 'total-runs', label: 'Total Runs', align: 'center' },
];

function CompareResultsTable(props: CompareResultsProps) {
  const { mode } = props;
  const compareResults: CompareResultsState = useAppSelector(
    (state) => state.compareResults,
  );
  return (
    <>
      {compareResults.data.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell align={header.align} key={header.id}>
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <PaginatedCompareResults mode={mode} />
          </Table>
        </TableContainer>
      )}
      {compareResults.loading && (
        <Box display="flex" justifyContent="center">
          <Grid item xs={1} className="compare-results-error">
            <CircularProgress />
          </Grid>
        </Box>
      )}
      {compareResults.error && (
        <Box display="flex" justifyContent="center">
          <Grid item xs={6} className="compare-results-error">
            <Alert severity="error" sx={{ textAlign: 'center' }}>
              Error: {compareResults.error}
            </Alert>
          </Grid>
        </Box>
      )}
    </>
  );
}

interface CompareResultsProps {
  mode: 'light' | 'dark';
}

export default CompareResultsTable;
