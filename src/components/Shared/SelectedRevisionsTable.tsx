import * as React from 'react';

import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { connect, useDispatch } from 'react-redux';

import { deleteRevision } from '../../reducers/SelectedRevisions';
import type { TableHeaders } from '../../types/enums';
import { Revision, State } from '../../types/state';

const tableHeaderDetails: TableHeaders[] = [
  'Project',
  'Revision',
  'Author',
  'Commit Message',
  'Timestamp',
];

function SelectedRevisionsTable(props: SelectedRevisionsProps) {
  const { revisions } = props;
  const dispatch = useDispatch();

  return (
    <TableContainer className="layout">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="row" />
            {tableHeaderDetails.map((header: TableHeaders) => (
              <TableCell key={header} sx={{ fontWeight: 600 }}>
                {header}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {revisions.map((row: Revision, index: number) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="cellStyle">{index === 0 ? 'BASE' : 'NEW'}</div>
              </TableCell>
              <TableCell>
                {/* TODO: add the repository name */}
                {row.repository_id}
              </TableCell>
              <TableCell>{row.revision}</TableCell>
              <TableCell>{row.author}</TableCell>
              <TableCell>{row.revisions[0].comments}</TableCell>
              <TableCell>{row.push_timestamp}</TableCell>
              <TableCell>
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
