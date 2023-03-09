import Close from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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

export function SelectedRevisionsTableRow(props: SelectedRevisionsRowProps) {
  const {
    row,
    index,
    view,
    setDropRow,
    setDraggedRow,
    handleDragEnd,
    dropRow,
    draggedRow,
  } = props;
  const dispatch = useAppDispatch();
  const commitMessage = getLatestCommitMessage(row);
  const date = formatDate(row.push_timestamp);
  const hash = truncateHash(row.revision);
  const repository = repoMap[row.repository_id] as Repository['name'];
  const treeherderURL = getTreeherderURL(row.revision, repository);

  return (
    <TableRow
      className={
        draggedRow === index
          ? 'draggedRow'
          : dropRow === index
          ? 'dropArea'
          : ''
      }
      draggable={true}
      id={row.revision}
      key={row.id}
      onDragEnd={handleDragEnd}
      onDragEnter={() => setDropRow(index)}
      onDragStart={() => setDraggedRow(index)}
    >
      <TableCell>
        <div className="dragIndicatorWrapper">
          <DragIndicatorIcon />
          <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
        </div>
      </TableCell>
      <TableCell>{repository}</TableCell>
      <TableCell>
        <Link href={treeherderURL}>{hash}</Link>
      </TableCell>
      <TableCell>{row.author}</TableCell>
      <TableCell className="commit-message">{commitMessage}</TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>
        {view == 'search' && (
          <IconButton
            id={`close-button-${row.id}`}
            onClick={() => dispatch(deleteRevision(row.id))}
            aria-label="Close"
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

export interface SelectedRevisionsRowProps {
  dropRow: number;
  draggedRow: number;
  handleDragEnd: () => void;
  index: number;
  row: Revision;
  setDraggedRow: (index: number) => void;
  setDropRow: (index: number) => void;
  view: 'search' | 'compare-results';
}

export default SelectedRevisionsTableRow;
