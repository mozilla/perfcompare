import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { RootState } from '../../../common/store';
import { useAppSelector } from '../../../hooks/app';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../../types/state';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

const customStyles = {
  boxShadow: 'none',
};

type Results = {
  key: string;
  value: CompareResultsItem[];
  revisionHeader: RevisionsHeader;
};


function processResults(results: CompareResultsItem[]) {
  const processedResults: Map<string, CompareResultsItem[]> = new Map<string, CompareResultsItem[]>();
  results.forEach(result => {
      if (processedResults.has(result.header_name)) {
        (processedResults.get(result.header_name) as CompareResultsItem[]).push(result);
      } else {
        processedResults.set(result.header_name, [result]);
      }
    });
    const restructuredResults: Results[] = Array.from(processedResults, function (entry) {
      return { 
        key: entry[0],
        value: entry[1],
        revisionHeader: {
         suite: entry[1][0].suite,
         test: entry[1][0].test,
         option_name: entry[1][0].option_name,
         extra_options: entry[1][0].extra_options,
        },
      };
    });

  return restructuredResults;

}

function ResultsTable(props: ResultsTableProps) {
  const { themeMode } = props;
  const compareResults: CompareResultsItem[] = useAppSelector(
    (state: RootState) => state.compareResults.data,
  );
  const processedResults = processResults(compareResults);


  const themeColor100 = themeMode === 'light' ? Colors.Background100 : Colors.Background100Dark;

  const styles = {
    tableContainer: style({
      backgroundColor: themeColor100,
      marginTop: Spacing.Large,
      $nest: {
        '.MuiTable-root': {
          borderSpacing: `0 ${Spacing.Small}px`,
          borderCollapse: 'separate',
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
      <Table>
        <TableHeader data-testid='table-header' themeMode={themeMode} />
        {processedResults.map((res, index) => (
            <TableContent themeMode={themeMode} key={index} header={res.revisionHeader} results={res.value} />
      ))}
      </Table>
    </TableContainer>
  );
}
interface ResultsTableProps {
  themeMode: 'light' | 'dark';
}

export default ResultsTable;
