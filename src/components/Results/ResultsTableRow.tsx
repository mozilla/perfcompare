import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { ResultsItem } from '../../types/state';

function ResultsTableRow(props: ResultsTableRowProps) {
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
  result: ResultsItem;
  index: number;
}

export default ResultsTableRow;
