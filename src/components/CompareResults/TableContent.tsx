import { style } from 'typestyle';

import { Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { results, header } = props;

  const styles = {
    tableBody: style({
      marginTop: Spacing.Large,
    }),
  };
  return (
    <div className={styles.tableBody} role='rowgroup'>
      <RevisionHeader header={header} />
      <div>
        {results.length > 0 &&
          results.map((result, index) => (
            <RevisionRow key={index} result={result} />
          ))}
      </div>
    </div>
  );
}

interface TableContentProps {
  results: CompareResultsItem[];
  header: RevisionsHeader;
}

export default TableContent;
