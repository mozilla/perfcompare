import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { repoMap } from '../../common/constants';
import { useAppDispatch } from '../../hooks/app';
import { deleteRevision } from '../../reducers/SelectedRevisions';
import { Repository, Revision } from '../../types/state';
import {
  formatDate,
  getLatestCommitMessage,
  getTreeherderURL,
  truncateHash,
} from '../../utils/helpers';
import EditRevisionButton from '../CompareResults/EditRevisionButton';

function SelectedRevisionsTableRow(props: SelectedRevisionsRowProps) {
  const { row, index, view } = props;
  const dispatch = useAppDispatch();
  const commitMessage = getLatestCommitMessage(row);
  const date = formatDate(row.push_timestamp);
  const hash = truncateHash(row.revision);
  const repository = repoMap[row.repository_id] as Repository['name'];
  const treeherderURL = getTreeherderURL(row.revision, repository);

  return (
    <TableRow key={row.id} id={row.revision}>
      <TableCell>
        <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
      </TableCell>
      <TableCell>{repository}</TableCell>
      <TableCell>
        <Link
          aria-label="Treeherder link"
          href={treeherderURL}
          rel="noopener"
          target="_blank"
        >
          {hash}
        </Link>
      </TableCell>
      <TableCell>{row.author}</TableCell>
      <TableCell className="commit-message">{commitMessage}</TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>
        {view == 'search' && (
          <IconButton
            id="close-button"
            onClick={() => dispatch(deleteRevision(row.id))}
          >
            <Close />
          </IconButton>
        )}
        {view == 'compare-results' && (
          <EditRevisionButton index={index} item={row} />
        )}
      </TableCell>
    </TableRow>
  );
}

interface SelectedRevisionsRowProps {
  row: Revision;
  index: number;
  view: 'search' | 'compare-results';
}

export default SelectedRevisionsTableRow;
