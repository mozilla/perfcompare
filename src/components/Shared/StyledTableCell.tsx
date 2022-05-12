import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  '&:first-of-type': {
    width: '50px',
  },
  paddingTop: '10px',
  paddingBottom: '10px',
}));

export default StyledTableCell;
