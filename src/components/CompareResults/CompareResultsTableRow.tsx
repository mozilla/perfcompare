import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
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
    <TableRow key={index} hover data-testid={'table-row'}>
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
      <TableCell>
        {result.is_improvement && <ThumbUpAltIcon color="success" />}{' '}
        {result.is_regression && <WarningIcon color="error" />}{' '}
      </TableCell>
      {result.confidence_text ? (
        <TableCell
          data-testid="confidence-icon"
          className={`background-icon ${setConfidenceClassName(
            result.confidence_text,
          )}`}
        ></TableCell>
      ) : (
        <TableCell
          data-testid="confidence-icon"
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
