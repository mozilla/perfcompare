import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { ResultsTableHeaders } from '../../types/enums';
import type { ResultsItem } from '../../types/state';
import ResultsTableRow from './ResultsTableRow';

const results: ResultsItem[] = [
  {
    platformName: 'Linux x64 asan',
    testName: 'a11y',
    baseValue: 300,
    newValue: 150,
    delta: -50,
    confidenceText: 'high',
    baseRuns: 1,
    newRuns: 1,
  },
];

const tableHeaders: ResultsTableHeaders[] = [
  'Platform',
  'Test Name',
  'Base',
  'New',
  'Delta',
  'Confidence',
  'Total Runs',
];

function ResultsTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array(10)
            .fill(0)
            .map((_, index) => {
              return (
                <ResultsTableRow
                  key={index}
                  result={results[0]}
                  index={index}
                />
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ResultsTable;
