import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { ConfidenceText, ResultsTableHeaders } from '../../types/enums';

// TODO: move to results state
interface ResultsItem {
  testName: string;
  platformName: string;
  baseValue: number;
  newValue: number;
  delta: number;
  confidenceText: ConfidenceText;
  baseRuns: number;
  newRuns: number;
}

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
              const {
                platformName,
                testName,
                baseValue,
                newValue,
                delta,
                confidenceText,
                baseRuns,
                newRuns,
              } = results[0];
              return (
                <TableRow key={index}>
                  <TableCell>{platformName}</TableCell>
                  <TableCell>{testName}</TableCell>
                  <TableCell>{baseValue}</TableCell>
                  <TableCell>{newValue}</TableCell>
                  <TableCell>{delta}%</TableCell>
                  <TableCell>{confidenceText}</TableCell>
                  <TableCell>
                    {baseRuns}/{newRuns}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ResultsTable;
