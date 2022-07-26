import { useState } from 'react';

import Close from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
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
import RevisionSearch from './RevisionSearch';

function SelectedRevisionsTableRow(props: SelectedRevisionsRowProps) {
  const { row, index, view } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const commitMessage = getLatestCommitMessage(row);
  const date = formatDate(row.push_timestamp);
  const hash = truncateHash(row.revision);
  const repository = repoMap[row.repository_id] as Repository['name'];
  const treeherderURL = getTreeherderURL(row.revision, repository);

  const anchorEl = document.getElementById(row.revision);

  return (
    <>
      <TableRow key={row.id} id={row.revision}>
        <TableCell>
          <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
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
              id="close-button"
              onClick={() => dispatch(deleteRevision(row.id))}
            >
              <Close />
            </IconButton>
          )}
          {view == 'compare-results' && (
            <IconButton
              id={`edit-revision-button-${index}`}
              aria-label={`edit-revision-${row.id}`}
              onClick={() => setIsOpen(true)}
            >
              <EditIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <Popover
        className="edit-revision-popover"
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <RevisionSearch inputWidth={9} view={view} />
      </Popover>
    </>
  );
}

interface SelectedRevisionsRowProps {
  row: Revision;
  index: number;
  view: 'search' | 'compare-results';
}

export default SelectedRevisionsTableRow;
