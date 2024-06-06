import { style } from 'typestyle';

import { Spacing } from '../../styles';
import type { CompareResultsItem, RevisionsHeader } from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { results, header, identifier, view } = props;

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
          results.map((result) => (
            <RevisionRow key={identifier + result.platform} result={result} view={view} />
          ))}
      </div>
    </div>
  );
}

interface TableContentProps {
  results: CompareResultsItem[];
  header: RevisionsHeader;
  identifier: string;
  view: string;
}

export default TableContent;
