import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default StyledTableRow;
