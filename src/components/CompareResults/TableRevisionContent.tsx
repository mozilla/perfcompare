import { style } from 'typestyle';

import type { compareView, compareOverTimeView } from '../../common/constants';
import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

const styles = {
  tableBody: style({
    marginTop: Spacing.Large,
  }),
};

function TableRevisionContent(props: Props) {
  const { results, view, rowGridTemplateColumns } = props;

  return (
    <div className={styles.tableBody} role='rowgroup'>
      {/* TODO change this to a test header */}
      <RevisionHeader result={results[0][1][0]} />
      <div>
        {results.length > 0 &&
          results.map(([, listOfResults]) =>
            // TODO add a revision header
            listOfResults.map((result) => (
              <RevisionRow
                key={result.platform}
                result={result}
                view={view}
                gridTemplateColumns={rowGridTemplateColumns}
              />
            )),
          )}
      </div>
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
