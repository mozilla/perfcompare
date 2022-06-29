import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import type { Revision } from '../../types/state';
import {
  truncateHash,
  getLatestCommitMessage,
  formatDate,
} from '../../utils/helpers';

export default function SearchResultsItem(props: SearchResultsItemProps) {
  const { item } = props;
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);

  return (
    <TableContainer data-testid={`compare-search-result-${item.id}`}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ border: 'none', width: '20px' }} align="left">
              {revisionHash}
            </TableCell>
            <TableCell sx={{ border: 'none' }} align="left">
              {commitMessage.slice(0, 60)}
            </TableCell>
            <TableCell sx={{ border: 'none' }} align="right">
              {item.author}{' '}
            </TableCell>
            <TableCell sx={{ border: 'none', width: '140px' }} align="right">
              {formatDate(item.push_timestamp)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface SearchResultsItemProps {
  item: Revision;
}
