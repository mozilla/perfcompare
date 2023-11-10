import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type {
  ThemeMode,
  CompareResultsItem,
  RevisionsHeader,
} from '../../types/state';
import type { LoaderReturnValue } from './loader';
import NoResultsFound from './NoResultsFound';
import TableContent from './TableContent';
import TableHeader from './TableHeader';

type Results = {
  key: string;
  value: CompareResultsItem[];
  revisionHeader: RevisionsHeader;
};

function processResults(results: CompareResultsItem[]) {
  const processedResults: Map<string, CompareResultsItem[]> = new Map<
    string,
    CompareResultsItem[]
  >();
  results.forEach((result) => {
    const { new_rev: newRevision, header_name: header } = result;
    const rowIdentifier = header.concat(' ', newRevision);
    if (processedResults.has(rowIdentifier)) {
      (processedResults.get(rowIdentifier) as CompareResultsItem[]).push(
        result,
      );
    } else {
      processedResults.set(rowIdentifier, [result]);
    }
  });
  const restructuredResults: Results[] = Array.from(
    processedResults,
    function ([rowIdentifier, result]) {
      return {
        key: rowIdentifier,
        value: result,
        revisionHeader: {
          suite: result[0].suite,
          framework_id: result[0].framework_id,
          test: result[0].test,
          option_name: result[0].option_name,
          extra_options: result[0].extra_options,
          new_rev: result[0].new_rev,
          new_repo: result[0].new_repository_name,
        },
      };
    },
  );

  return restructuredResults;
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

const customStyles = {
  boxShadow: 'none',
};

function ResultsTable(props: ResultsTableProps) {
  const { themeMode } = props;

  const { results } = useLoaderData() as LoaderReturnValue;
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const processedResults = useMemo(() => {
    const resultsForCurrentComparison =
      activeComparison === allRevisionsOption
        ? results.flat()
        : results.find((result) => result[0].new_rev === activeComparison) ??
          [];
    return processResults(resultsForCurrentComparison);
  }, [results, activeComparison]);

  // TODO support loading through the react-router defer mechanism
  // const loading = useAppSelector((state) => state.compareResults.loading);
  const loading = false;

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
          <TableHeader themeMode={themeMode} />
          {processedResults.map((res, index) => (
            <TableContent
              themeMode={themeMode}
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
interface ResultsTableProps {
  themeMode: ThemeMode;
}

export default ResultsTable;
