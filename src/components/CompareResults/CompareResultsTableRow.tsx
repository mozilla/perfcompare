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
  const confidenceTooltip = result.confidence
    ? result.confidence_text_long
    : 'Unknown confidence.';

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
          target="_blank"
          rel="noopener"
        >
          <TimelineIcon />
        </Link>
      </TableCell>
      <TableCell>{result.header_name}</TableCell>
      <TableCell>
        {result.base_median_value} {result.base_measurement_unit}
      </TableCell>
      <TableCell>
        {result.new_median_value} {result.new_measurement_unit}
      </TableCell>
      <TableCell>{result.delta_percentage}%</TableCell>
      <Tooltip title={confidenceTooltip}>
        <TableCell
          className={`background-icon ${setConfidenceClassName(
            result.confidence_text,
          )}`}
        ></TableCell>
      </Tooltip>
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
