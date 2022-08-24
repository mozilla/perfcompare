import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useAppSelector } from '../../hooks/app';
import type { CompareResultsItem } from '../../types/state';
import type { CompareResultsTableHeaders } from '../../types/types';
import CompareResultsTableRow from './CompareResultsTableRow';

const tableHeaders: CompareResultsTableHeaders[] = [
  { id: 'platform', label: 'Platform', align: 'center' },
  { id: 'graph', label: 'Graph', align: 'center' },
  { id: 'suite', label: 'Suite', align: 'left' },
  { id: 'test-name', label: 'Test Name', align: 'left' },
  { id: 'base-value', label: 'Base', align: 'center' },
  { id: 'new-value', label: 'New', align: 'center' },
  { id: 'delta-percent', label: 'Delta', align: 'center' },
  { id: 'confidence', label: 'Confidence', align: 'center' },
  { id: 'total-runs', label: 'Total Runs', align: 'center' },
];

function CompareResultsTable(props: CompareResultsProps) {
  const { mode } = props;
  const compareResults: CompareResultsItem[] = useAppSelector(
    (state) => state.compareResults,
  );
  return (
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
        <TableBody>
          {compareResults.length > 0 &&
            compareResults.map((result, index) => (
              <CompareResultsTableRow
                key={index}
                result={result}
                index={index}
                mode={mode}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface CompareResultsProps {
  mode: 'light' | 'dark';
}

export default CompareResultsTable;
