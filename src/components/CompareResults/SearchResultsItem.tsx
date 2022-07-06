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
            <TableCell
              className="revision-hash"
              // sx={{ border: 'none', width: '30px', minWidth: '30px' }}
              align="left"
            >
              {revisionHash}
            </TableCell>
            <TableCell align="left">{commitMessage.slice(0, 60)}</TableCell>
            <TableCell align="right">{item.author} </TableCell>
            <TableCell align="right">
              {/* <TableCell sx={{ border: 'none', width: '140px' }} align="right"> */}
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
