import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useAppSelector } from '../../hooks/app';
import EditSearchResultsTableRow from './EditSearchResultsTableRow';

function EditSearchResultsTable() {
  const { searchResults } = useAppSelector((state) => state.search);
  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          {searchResults &&
            searchResults.map((result) => (
              // TODO: implement onClick action
              <EditSearchResultsTableRow key={result.id} result={result} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default EditSearchResultsTable;
