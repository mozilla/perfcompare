import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { selectProcessedResults } from '../../reducers/ComparisonSlice';
import { Colors, Spacing } from '../../styles';
import NoResultsFound from './NoResultsFound';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

const customStyles = {
  boxShadow: 'none',
};

function ResultsTable() {
  const themeMode = useAppSelector((state) => state.theme.mode);

  const loading = useAppSelector((state) => state.compareResults.loading);

  const processedResults = useAppSelector(selectProcessedResults);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background100 : Colors.Background100Dark;

  const styles = {
    tableContainer: style({
      backgroundColor: themeColor100,
      marginTop: Spacing.Large,
      $nest: {
        '.MuiTable-root': {
          borderSpacing: `0 ${Spacing.Small}px`,
          borderCollapse: 'separate',
          paddingBottom: Spacing.Large,
        },
      },
    }),
  };

  return (
    <TableContainer
      component={Paper}
      className={styles.tableContainer}
      data-testid='results-table'
      sx={customStyles}
    >
      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHeader />
          {processedResults.map((res, index) => (
            <TableContent
              key={index}
              header={res.revisionHeader}
              results={res.value}
            />
          ))}
        </Table>
      )}
      {!loading && processedResults.length == 0 && <NoResultsFound />}
    </TableContainer>
  );
}

export default ResultsTable;
