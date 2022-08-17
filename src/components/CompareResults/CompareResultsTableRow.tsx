import TimelineIcon from '@mui/icons-material/Timeline';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import type { CompareResultsItem } from '../../types/state';
import {
  setPlatformClassName,
  setConfidenceClassName,
} from '../../utils/helpers';

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
      <TableCell>
        <Link
          href={result.graphs_link}
          className={`background-icon ${mode}-mode graph-icon-color`}
          aria-label="Graph link"
        >
          <TimelineIcon />
        </Link>
      </TableCell>
      <TableCell>{result.suite}</TableCell>
      <TableCell>{result.test}</TableCell>
      <TableCell>{result.base_avg_value}</TableCell>
      <TableCell>{result.new_avg_value}</TableCell>
      <TableCell>{result.delta_percentage}%</TableCell>
      <TableCell
        className={`background-icon ${setConfidenceClassName(
          result.confidence_text,
        )}`}
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
