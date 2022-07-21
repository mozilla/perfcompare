import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import type { Revision } from '../../types/state';
import {
  truncateHash,
  getLatestCommitMessage,
  formatDate,
} from '../../utils/helpers';

function EditSearchResultsTableRow(props: EditSearchResultsTableRowProps) {
  const { result } = props;

  return (
    <TableRow hover>
      <TableCell className="edit-search-results">
        {truncateHash(result.revision)}
      </TableCell>
      <TableCell className="edit-search-results">{result.author}</TableCell>
      <TableCell className="edit-search-results commit-message">
        {getLatestCommitMessage(result)}
      </TableCell>
      <TableCell className="edit-search-results">
        {formatDate(result.push_timestamp)}
      </TableCell>
    </TableRow>
  );
}

interface EditSearchResultsTableRowProps {
  result: Revision;
}

export default EditSearchResultsTableRow;
