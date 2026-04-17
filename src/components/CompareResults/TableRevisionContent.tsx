import { style } from 'typestyle';

import LinkToRevision from './LinkToRevision';
import RevisionRow from './RevisionRow';
import TestHeader from './TestHeader';
import type { compareView, compareOverTimeView } from '../../common/constants';
import { useSubtestRegressionCount } from '../../hooks/useSubtestRegressionCount';
import { Colors, Spacing } from '../../styles';
import type { CombinedResultsItemType } from '../../types/state';
import { TestVersion } from '../../types/types';

// We're using typestyle styles on purpose, to avoid the performance impact of
// MUI's sx prop for these numerous elements.
// Also note that we're using paddings, not margins. Indeed Virtuoso can't
// compute properly the heights of the elements if we're using margins, but
// paddings work fine.
const styles = {
  testBlock: style({
    /* Note that this padding will be added to the padding below */
    paddingTop: Spacing.Small,
  }),
  revisionBlock: style({ paddingBottom: Spacing.Large }),
  subtestCountsRow: style({
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    justifyContent: 'flex-end',
  }),
  loadingMessage: style({
    fontSize: '0.75rem',
    marginBottom: '8px',
    textAlign: 'right',
  }),
  regressionPill: style({
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    backgroundColor: Colors.Background400,
  }),
  improvementPill: style({
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    backgroundColor: Colors.Background500,
  }),
};

function TableRevisionContent(props: Props) {
  const { results, view, rowGridTemplateColumns, replicates, testVersion } =
    props;

  const { counts: subtestCounts, isLoading: subtestsLoading } =
    useSubtestRegressionCount({
      results,
      view,
      replicates,
      testVersion,
    });

  if (!results.length) {
    return null;
  }

  // All results are for the same test, so any result should generate the same
  // header appropriately.
  // Here we use the first result for the first revision.
  //                                         First result
  //                               Value of the tuple |
  //                                First revision |  |
  //                                            |  |  |
  //                                            v  v  v
  const representativeResultForHeader = results[0][1][0];
  const hasMoreThanOneNewRev = results.length > 1;

  return (
    <div
      className={`table-revision-content ${styles.testBlock}`}
      role='rowgroup'
    >
      <TestHeader
        result={representativeResultForHeader}
        withRevision={!hasMoreThanOneNewRev}
      />
      {subtestsLoading && (
        <div className={styles.loadingMessage}>
          Fetching subtests regressions and improvements...
        </div>
      )}
      {subtestCounts !== null && (
        <div className={styles.subtestCountsRow}>
          {subtestCounts.regressionCount > 0 && (
            <div className={styles.regressionPill}>
              {subtestCounts.regressionCount} subtest{' '}
              {subtestCounts.regressionCount === 1
                ? 'regression'
                : 'regressions'}
            </div>
          )}
          {subtestCounts.improvementCount > 0 && (
            <div className={styles.improvementPill}>
              {subtestCounts.improvementCount} subtest{' '}
              {subtestCounts.improvementCount === 1
                ? 'improvement'
                : 'improvements'}
            </div>
          )}
        </div>
      )}
      {results.map(([revision, listOfResults]) => (
        <div
          className={`revision-block ${styles.revisionBlock}`}
          key={revision}
        >
          {hasMoreThanOneNewRev && <LinkToRevision result={listOfResults[0]} />}
          {listOfResults.map((result) => (
            <RevisionRow
              key={result.platform}
              result={result}
              view={view}
              gridTemplateColumns={rowGridTemplateColumns}
              replicates={replicates}
              testVersion={testVersion}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface Props {
  // "results" contains all results for just one test, grouped by revisions.
  //
  //              revision        list of results for one test and revision
  //                 |               |
  //                 v               v
  results: Array<[string, CombinedResultsItemType[]]>;
  rowGridTemplateColumns: string;
  view: typeof compareView | typeof compareOverTimeView;
  replicates: boolean;
  testVersion: TestVersion;
}

export default TableRevisionContent;
