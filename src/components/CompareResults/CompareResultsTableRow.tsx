import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import TimelineIcon from '@mui/icons-material/Timeline';
import IconButton from '@mui/material/IconButton';
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
          target="_blank"
          rel="noopener"
        >
          <TimelineIcon />
        </Link>
      </TableCell>
      <TableCell>
      <Tooltip title={result.description}>
        <div> {result.header_name} </div>
        </Tooltip>
        </TableCell>
      <TableCell>
        {result.base_median_value} {result.base_measurement_unit}
      </TableCell>
      <TableCell>
        {result.new_median_value} {result.new_measurement_unit}
      </TableCell>
      <TableCell>{result.delta_percentage}%</TableCell>
      {result.confidence_text ? (
        <TableCell
          className={`background-icon ${setConfidenceClassName(
            result.confidence_text,
          )}`}
        ></TableCell>
      ) : (
        <TableCell
          className={`${setConfidenceClassName(result.confidence_text)}`}
        >
          <Tooltip title="Confidence not available">
            <IconButton className="missing-confidence-button">
              <QuestionMarkIcon className="missing-confidence-icon" />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}

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
