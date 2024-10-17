import { style } from 'typestyle';

import type { compareView, compareOverTimeView } from '../../common/constants';
import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import LinkToRevision from './LinkToRevision';
import RevisionRow from './RevisionRow';
import TestHeader from './TestHeader';

// We're using typestyle styles on purpose, to avoid the performance impact of
// MUI's sx prop for these numerous elements.
const styles = {
  testBlock: style({
    /* Note that this margin will be merged with the margin below */
    marginTop: Spacing.xLarge,
  }),
  revisionBlock: style({ marginBottom: Spacing.Large }),
};

function TableRevisionContent(props: Props) {
  const { results, view, rowGridTemplateColumns } = props;

  if (!results.length) {
    return null;
  }

  // All results are for the same test, so any results hould generate the same
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
}

export default TableRevisionContent;
