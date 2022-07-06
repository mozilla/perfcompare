import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import type { CompareResultsItem } from '../../types/state';
import { setPlatformClassName } from '../../utils/helpers';

function CompareResultsTableRow(props: ResultsTableRowProps) {
  const { result, index, mode } = props;

  return (
    <TableRow key={index}>
      <Tooltip title={result.platform}>
        <TableCell
          className={`background-icon ${mode}-mode ${setPlatformClassName(
            result.platform,
          )}`}
        ></TableCell>
      </Tooltip>
      <TableCell>{result.suite}</TableCell>
      <TableCell>{result.test}</TableCell>
      <TableCell>{result.base_avg_value}</TableCell>
      <TableCell>{result.new_avg_value}</TableCell>
      <TableCell>{result.delta}%</TableCell>
      <TableCell
        className={`background-icon ${result.confidence_text}`}
      ></TableCell>
      <TableCell>
        {result.base_runs.length}/{result.new_runs.length}
      </TableCell>
    </TableRow>
  );
}

interface ResultsTableRowProps {
  result: CompareResultsItem;
  index: number;
  mode: 'light' | 'dark';
}

export default CompareResultsTableRow;
