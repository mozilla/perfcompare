import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { selectProcessedResults } from '../../reducers/ComparisonSlice';
import { Colors, Spacing } from '../../styles';
import NoResultsFound from './NoResultsFound';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

const customStyles = {
  boxShadow: 'none',
  background: 'none',
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
      paddingBottom: Spacing.Large,
    }),
  };

  return (
    <Paper
      className={styles.tableContainer}
      data-testid='results-table'
      sx={customStyles}
      role='table'
    >
      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableHeader />
          {processedResults.map((res, index) => (
            <TableContent
              key={index}
              header={res.revisionHeader}
              results={res.value}
            />
          ))}
        </>
      )}
      {!loading && processedResults.length == 0 && <NoResultsFound />}
    </Paper>
  );
}

export default ResultsTable;
