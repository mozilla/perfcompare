import { style } from 'typestyle';

import LinkToRevision from './LinkToRevision';
import RevisionRow from './RevisionRow';
import TestHeader from './TestHeader';
import type { compareView, compareOverTimeView } from '../../common/constants';
import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';

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
};

function TableRevisionContent(props: Props) {
  const { results, view, rowGridTemplateColumns, replicates } = props;

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
    <div className={styles.testBlock} role='rowgroup'>
      <TestHeader
        result={representativeResultForHeader}
        withRevision={!hasMoreThanOneNewRev}
      />
      {results.map(([revision, listOfResults]) => (
        <div className={styles.revisionBlock} key={revision}>
          {hasMoreThanOneNewRev && <LinkToRevision result={listOfResults[0]} />}
          {listOfResults.map((result) => (
            <RevisionRow
              key={result.platform}
              result={result}
              view={view}
              gridTemplateColumns={rowGridTemplateColumns}
              replicates={replicates}
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
  results: Array<[string, CompareResultsItem[]]>;
  rowGridTemplateColumns: string;
  view: typeof compareView | typeof compareOverTimeView;
  replicates: boolean;
}

export default TableRevisionContent;
