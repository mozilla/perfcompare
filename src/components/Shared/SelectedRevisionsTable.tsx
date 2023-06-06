import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { connect } from 'react-redux';

import type { AppDispatch, RootState } from '../../common/store';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import type { RevisionsList } from '../../types/state';
import type { SelectedRevisionsTableHeaders } from '../../types/types';
import { swapArrayElements } from '../../utils/helpers';
import SelectedRevisionsTableRow from './SelectedRevisionsTableRow';

const tableHeaderDetails: SelectedRevisionsTableHeaders[] = [
  'Project',
  'Revision',
  'Author',
  'Commit Message',
  'Timestamp',
];

export function SelectedRevisionsTable(props: SelectedRevisionsProps) {
  const { revisions, view, dispatchSelectedRevisions } = props;
  const size = view == 'compare-results' ? 'small' : undefined;
  const [draggedRow, setDraggedRow] = useState(-1);
  const [dropRow, setDropRow] = useState(-1);
  const handleDragEnd = () => {
    dispatchSelectedRevisions(
      swapArrayElements(revisions, dropRow, draggedRow),
    );
    setDropRow(-1);
    setDraggedRow(-1);
  };
  return (
    <TableContainer className='layout'>
      <Table className={`${view}-selected-table`} size={size}>
        <TableHead>
          <TableRow>
            <TableCell component='th' scope='row' />
            {tableHeaderDetails.map((header: SelectedRevisionsTableHeaders) => (
              <TableCell key={header} sx={{ fontWeight: 600 }}>
                {header}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {revisions.map((row: RevisionsList, index: number) => (
            <SelectedRevisionsTableRow
              dropRow={dropRow}
              draggedRow={draggedRow}
              handleDragEnd={handleDragEnd}
              index={index}
              key={row.revision}
              row={row}
              setDraggedRow={setDraggedRow}
              setDropRow={setDropRow}
              view={view}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface SelectedRevisionsProps {
  revisions: RevisionsList[];
  view: 'search' | 'compare-results';
  dispatchSelectedRevisions: (revisions: RevisionsList[]) => void;
}

function mapStateToProps(state: RootState) {
  return {
    revisions: state.selectedRevisions.revisions,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    dispatchSelectedRevisions: (revisions: RevisionsList[]) =>
      dispatch(setSelectedRevisions(revisions)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectedRevisionsTable);
