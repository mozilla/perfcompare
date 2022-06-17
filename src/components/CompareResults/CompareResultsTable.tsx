import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSelector } from 'react-redux';

import type { RootState } from '../../common/store';
import type { CompareResultsItem } from '../../types/state';
import type { CompareResultsTableHeaders } from '../../types/types';
import CompareResultsTableRow from './CompareResultsTableRow';

const tableHeaders: CompareResultsTableHeaders[] = [
  'Platform',
  'Suite',
  'Test Name',
  'Base',
  'New',
  'Delta',
  'Confidence',
  'Total Runs',
];

function CompareResultsTable() {
  const compareResults: CompareResultsItem[] = useSelector(
    (state: RootState) => state.compareResults,
  );
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header, index) => (
              <TableCell key={index}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {compareResults.length > 0 &&
            compareResults.map((result, index) => (
              <CompareResultsTableRow
                key={index}
                result={result}
                index={index}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompareResultsTable;
