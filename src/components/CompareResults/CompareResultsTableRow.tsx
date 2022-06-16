import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import type { CompareResultsItem } from '../../types/state';

function CompareResultsTableRow(props: ResultsTableRowProps) {
  const { index } = props;
  const {
    platformName,
    testName,
    baseValue,
    newValue,
    delta,
    confidenceText,
    baseRuns,
    newRuns,
  } = props.result;
  return (
    <TableRow key={index}>
      <TableCell>{platformName}</TableCell>
      <TableCell>{testName}</TableCell>
      <TableCell>{baseValue}</TableCell>
      <TableCell>{newValue}</TableCell>
      <TableCell>{delta}%</TableCell>
      <TableCell className={confidenceText}></TableCell>
      <TableCell>
        {baseRuns}/{newRuns}
      </TableCell>
    </TableRow>
  );
}

interface ResultsTableRowProps {
  result: CompareResultsItem;
  index: number;
}

export default CompareResultsTableRow;
