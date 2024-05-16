import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import type { LoaderReturnValue } from './loader';
import NoResultsFound from './NoResultsFound';
import type { LoaderReturnValue as OverTimeLoadResults } from './overTimeLoader';
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
  background: 'none',
};

function ResultsTable(props: { isOverTime: boolean }) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { isOverTime } = props;
  const { results: withBaseResults } = useLoaderData() as LoaderReturnValue;
  const { results: overTimeResults } = useLoaderData() as OverTimeLoadResults;
  const results = isOverTime ? overTimeResults : withBaseResults;

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

  // TODO Implement a loading UI through the react-router defer mechanism
  const loading = false;

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
