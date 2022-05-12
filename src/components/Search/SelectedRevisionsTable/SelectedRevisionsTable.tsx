import * as React from 'react';

import Close from '@mui/icons-material/Close';
import { TableRow } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { connect, useDispatch } from 'react-redux';

import { deleteRevision } from '../../../reducers/SelectedRevisions';
import { Revision, State } from '../../../types/state';
import { TableHeaderDetails } from '../../../types/tableHeaderDetails';
// import StyledTableCell from '../../Shared/StyledTableCell';
import './SelectedRevisionsTable.css';

const tableHeaderDetails: TableHeaderDetails[] = [
  { id: 1, title: 'Project', alignment: 'left' },
  { id: 2, title: 'Revision', alignment: 'left' },
  { id: 3, title: 'Author', alignment: 'left' },
  { id: 4, title: 'Commit message', alignment: 'center' },
  { id: 5, title: 'Timestamp', alignment: 'left' },
];

function SelectedRevisionsTable(props: SelectedRevisionsProps) {
  const { revisions } = props;
  const dispatch = useDispatch();

  if (revisions.length === 0) {
    return <div className="missingRevisions">Add some revisions</div>;
  }
  return (
    <TableContainer className="layout">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {tableHeaderDetails.map((header: TableHeaderDetails) => (
              <TableCell
                key={header.id}
                align={header.alignment}
                className="title"
              >
                {header.title}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {revisions.map((row: Revision, index: number) => (
            <TableRow key={row.id} className="rowStyle">
              <TableCell className="cellStyle" component="th" scope="row">
                <div className="projectCell">
                  {index === 0 ? 'BASE' : 'NEW'}
                </div>
              </TableCell>
              <TableCell className="cellStyle" component="th" scope="row">
                {/* need to add the repository name */}
                {row.repository_id}
              </TableCell>
              <TableCell className="cellStyle" align="left">
                {row.revision}
              </TableCell>
              <TableCell className="cellStyle" align="left">
                {row.author}
              </TableCell>
              <TableCell className="cellStyle" align="center">
                {row.revisions[0].comments}
              </TableCell>
              <TableCell className="cellStyle" align="left">
                {row.push_timestamp}
              </TableCell>
              <TableCell className="cellStyle" align="right">
                <IconButton
                  id="close-button"
                  onClick={() => dispatch(deleteRevision(row.id))}
                >
                  <Close />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="helperText">Maximum 4 revisions.</div>
    </TableContainer>
  );
}

interface SelectedRevisionsProps {
  revisions: Revision[];
}

function mapStateToProps(state: State) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}

export default connect(mapStateToProps)(SelectedRevisionsTable);
