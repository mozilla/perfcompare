import * as React from 'react';

import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { connect, useDispatch } from 'react-redux';

import { deleteRevision } from '../../../reducers/SelectedRevisions';
import { Revision, State } from '../../../types/state';
import { TableHeaderDetails } from '../../../types/tableHeaderDetails';
import StyledTableCell from '../../Shared/StyledTableCell';
import StyledTableRow from '../../Shared/StyledTableRow';
import './SelectedRevisionsTable.css';

const tableHeaderDetails: TableHeaderDetails[] = [
  { id: 1, title: 'Project', alignment: 'left' },
  { id: 2, title: 'Revision', alignment: 'left' },
  { id: 3, title: 'Author', alignment: 'left' },
  { id: 4, title: 'Commit message', alignment: 'center' },
  { id: 5, title: 'Timestamp', alignment: 'left' },
];

function SelectedRevisionsTable(props: SelectedRevisionsProps) {
  const dispatch = useDispatch();

  const { revisions } = props;

  return (
    <TableContainer className="layout">
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell />
            {tableHeaderDetails.map((header: TableHeaderDetails) => (
              <StyledTableCell
                key={header.id}
                align={header.alignment}
                className="title"
              >
                {header.title}
              </StyledTableCell>
            ))}
            <StyledTableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {revisions.map((row: Revision, index: number) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {/* need to add the repository name */}
                {row.repository_id}
              </StyledTableCell>
              <StyledTableCell align="left">{row.revision}</StyledTableCell>
              <StyledTableCell align="left">{row.author}</StyledTableCell>
              <StyledTableCell align="center">
                {row.revisions[0].comments}
              </StyledTableCell>
              <StyledTableCell align="left">
                {row.push_timestamp}
              </StyledTableCell>
              <StyledTableCell align="right">
                <IconButton
                  id="close-button"
                  onClick={() => dispatch(deleteRevision(row.id))}
                >
                  <Close />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
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
