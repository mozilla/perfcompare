import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { selectProcessedResults } from '../../reducers/ComparisonSlice';
import { Colors, Spacing } from '../../styles';
import { ThemeMode } from '../../types/state';
import NoResultsFound from './NoResultsFound';
import TableContentGrid from './TableContentGrid';
import TableHeaderGrid from './TableHeaderGrid';

const customStyles = {
  boxShadow: 'none',
};

function ResultsTableGrid(props: ResultsTableGridProps) {
  const { themeMode } = props;

  const loading = useAppSelector((state) => state.compareResults.loading);

  const processedResults = useAppSelector(selectProcessedResults);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background100 : Colors.Background100Dark;

  const styles = {
    tableContainer: style({
      backgroundColor: themeColor100,
      borderCollapse: 'separate',
      borderSpacing: `0 ${Spacing.Small}px`,
      marginTop: Spacing.Large,
      paddingBottom: Spacing.Large,
    }),
  };

  return (
    <Paper
      className={styles.tableContainer}
      data-testid='results-table'
      sx={customStyles}
      role="table"
    >
      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      ) : (
        <div>
          <TableHeaderGrid themeMode={themeMode} />
          {processedResults.map((res, index) => (
            <div key={index}>
              <TableContentGrid
                themeMode={themeMode}
                key={index}
                header={res.revisionHeader}
                results={res.value}
              />
            </div>
          ))}
        </div>
      )}
      {!loading && processedResults.length == 0 && <NoResultsFound />}
    </Paper>
  );
}

interface ResultsTableGridProps {
  themeMode: ThemeMode;
}

export default ResultsTableGrid;
