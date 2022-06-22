import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
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
import EditRevision from '../CompareResults/EditRevision';

function SelectedRevisionsTableRow(props: SelectedRevisionsRowProps) {
  const { focused, handleFocus, index, row, view } = props;
  const dispatch = useDispatch();
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
        <a href={treeherderURL} target="_blank" rel="noreferrer">
          {hash}
        </a>
      </TableCell>
      <TableCell>{row.author}</TableCell>
      <TableCell>
        <div className="commit-message">{commitMessage}</div>
      </TableCell>
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
          <EditRevision
            revision={row.revision}
            rowID={row.id}
            focused={focused}
            handleFocus={handleFocus}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

interface SelectedRevisionsRowProps {
  focused?: boolean | undefined;
  handleFocus?: (e: React.FocusEvent) => void | undefined;
  row: Revision;
  index: number;
  view: 'search' | 'compare-results';
}

export default SelectedRevisionsTableRow;
