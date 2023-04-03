import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import type { CompareResultsState } from '../../types/state';
import CompareTableStatus from './CompareTableStatus';
import PaginatedCompareResults from './PaginatedCompareResults';

function CompareResultsTable(props: CompareResultsProps) {
  const { theme } = props;
  const compareResults: CompareResultsState = useAppSelector(
    (state: RootState) => state.compareResults,
  );

  return (
    <>
      {!compareResults.loading && (
        <>
          <CompareTableStatus />
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table"
            >
              <colgroup>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'20%' }}/>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'10%' }}/>
      <col style={{ width:'12%' }}/>
      <col style={{ width:'8%' }}/>
   </colgroup>
              <PaginatedCompareResults theme={theme} />
            </Table>
          </TableContainer>
        </>
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
  theme: string;
}

export default CompareResultsTable;
