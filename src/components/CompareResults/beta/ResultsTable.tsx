import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { style } from 'typestyle';

import { RootState } from '../../../common/store';
import { useAppSelector } from '../../../hooks/app';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../../types/state';
import NoResultsFound from './NoResultsFound';
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
      const { new_rev: newRevision, header_name: header } = result;
      const rowIdentifier = header.concat(' ', newRevision);
      if (processedResults.has(rowIdentifier)) {
        (processedResults.get(rowIdentifier) as CompareResultsItem[]).push(result);
      } else {
        processedResults.set(rowIdentifier, [result]);
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
         new_rev: entry[1][0].new_rev,
         new_repo: entry[1][0].new_repository_name,
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
      <Table>
        <TableHeader themeMode={themeMode} />
        {processedResults.map((res, index) => (
            <TableContent themeMode={themeMode} key={index} header={res.revisionHeader} results={res.value} />
      ))}
      </Table>
      {processedResults.length == 0 && <NoResultsFound/>}
    </TableContainer>
  );
}
interface ResultsTableProps {
  themeMode: 'light' | 'dark';
}

export default ResultsTable;
