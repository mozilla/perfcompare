import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useDispatch } from 'react-redux';

import { repoMap } from '../../common/constants';
import { deleteRevision } from '../../reducers/SelectedRevisions';
import { Repository, Revision } from '../../types/state';
import {
  formatDate,
  getLatestCommitMessage,
  getTreeherderURL,
  truncateHash,
} from '../../utils/helpers';

function SelectedRevisionsTableRow(props: SelectedRevisionsRowProps) {
  const { row, index } = props;
  const dispatch = useDispatch();
  const commitMessage = getLatestCommitMessage(row);
  const date = formatDate(row.push_timestamp);
  const hash = truncateHash(row.revision);
  const repository = repoMap[row.repository_id] as Repository['name'];
  const treeherderURL = getTreeherderURL(row.revision, repository);

  return (
    <TableRow key={row.id}>
      <TableCell>
        <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
      </TableCell>
      <TableCell>{repository}</TableCell>
      <TableCell>
        <Link href={treeherderURL}>{hash}</Link>
      </TableCell>
      <TableCell>{row.author}</TableCell>
      <TableCell>
        <div className="commit-message">{commitMessage}</div>
      </TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>
        <IconButton
          id="close-button"
          onClick={() => dispatch(deleteRevision(row.id))}
        >
          <Close />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

interface SelectedRevisionsRowProps {
  row: Revision;
  index: number;
}

export default SelectedRevisionsTableRow;
