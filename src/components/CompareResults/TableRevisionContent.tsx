import { style } from 'typestyle';

import type { compareView, compareOverTimeView } from '../../common/constants';
import { Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

const styles = {
  tableBody: style({
    marginTop: Spacing.Large,
  }),
};

function TableRevisionContent(props: Props) {
  const { results, header, identifier, view, rowGridTemplateColumns } = props;

  return (
    <div className={styles.tableBody} role='rowgroup'>
      <RevisionHeader header={header} />
      <div>
        {results.length > 0 &&
          results.map((result) => (
            <RevisionRow
              key={identifier + result.platform}
              result={result}
              view={view}
              gridTemplateColumns={rowGridTemplateColumns}
            />
          ))}
      </div>
    </div>
  );
}

interface Props {
  results: CompareResultsItem[];
  header: RevisionsHeader;
  identifier: string;
  rowGridTemplateColumns: string;
  view: typeof compareView | typeof compareOverTimeView;
}

export default TableRevisionContent;
