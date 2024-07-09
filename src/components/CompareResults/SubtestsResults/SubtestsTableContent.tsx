import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../../types/state';
import RevisionRow from './SubtestsRevisionRow';

function TableContent(props: TableContentProps) {
  const { results, identifier } = props;

  const styles = {
    tableBody: style({
      marginTop: Spacing.Large,
    }),
  };
  return (
    <div className={styles.tableBody} role='rowgroup'>
      {/* <RevisionHeader header={header} /> */}
      <div>
        {results.length > 0 &&
          results.map((result) => (
            <RevisionRow key={identifier + result.platform} result={result} />
          ))}
      </div>
    </div>
  );
}

interface TableContentProps {
  results: CompareResultsItem[];
  header: RevisionsHeader;
  identifier: string;
}

export default TableContent;
