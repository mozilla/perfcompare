import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
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

function filterBySearchTerm(results: CompareResultsItem[], searchTerm: string) {
  if (!searchTerm) {
    return results;
  }

  return results.filter(
    (result) =>
      result.suite.includes(searchTerm) ||
      result.extra_options.includes(searchTerm) ||
      result.option_name.includes(searchTerm) ||
      result.test.includes(searchTerm) ||
      result.new_rev.includes(searchTerm) ||
      result.platform.includes(searchTerm),
  );
}

const headerCellsConfiguration = [
  {
    name: 'Platform',
    disable: true,
    filter: true,
    key: 'platform',
    sort: true,
  },
  {
    name: 'Base',
    key: 'base',
  },
  { key: 'comparisonSign' },
  { name: 'New', key: 'new' },
  {
    name: 'Status',
    disable: true,
    filter: true,
    key: 'status',
    sort: true,
  },
  {
    name: 'Delta(%)',
    key: 'delta',
  },
  {
    name: 'Confidence',
    disable: true,
    filter: true,
    key: 'confidence',
    sort: true,
  },
  { name: 'Total Runs', key: 'runs' },
  { key: 'buttons' },
  { key: 'expand' },
];

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions.key;

type ResultsTableProps = {
  results: CompareResultsItem[][];
  filteringSearchTerm: string;
};

function ResultsTable({ results, filteringSearchTerm }: ResultsTableProps) {
  const activeComparison = useAppSelector(
    (state) => state.comparison.activeComparison,
  );

  const processedResults = useMemo(() => {
    const resultsForCurrentComparison =
      activeComparison === allRevisionsOption
        ? results.flat()
        : results.find((result) => result[0].new_rev === activeComparison) ??
          [];

    const filteredResults = filterBySearchTerm(
      resultsForCurrentComparison,
      filteringSearchTerm,
    );
    return processResults(filteredResults);
  }, [results, activeComparison, filteringSearchTerm]);

  // TODO Implement a loading UI through the react-router defer mechanism
  const loading = false;

  const styles = {
    tableContainer: style({
      marginTop: Spacing.Large,
      paddingBottom: Spacing.Large,
    }),
  };

  return (
    <Box
      className={styles.tableContainer}
      data-testid='results-table'
      role='table'
    >
      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableHeader headerCellsConfiguration={headerCellsConfiguration} />
          {processedResults.map((res) => (
            <TableContent
              key={res.key}
              identifier={res.key}
              header={res.revisionHeader}
              results={res.value}
            />
          ))}
        </>
      )}
      {!loading && processedResults.length == 0 && <NoResultsFound />}
    </Box>
  );
}

export default ResultsTable;
