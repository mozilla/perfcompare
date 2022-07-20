import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { useSelector } from 'react-redux';

import { RootState } from '../../common/store';
import EditSearchResultsTableRow from './EditSearchResultsTableRow';

function EditSearchResultsTable() {
  const { searchResults } = useSelector((state: RootState) => state.search);
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
