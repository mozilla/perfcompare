import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import SubtestsRevisionRow from './SubtestsRevisionRow';

const styles = {
  tableBody: style({
    marginTop: Spacing.Large,
  }),
};

function SubtestsTableContent(props: SubtestsTableContentProps) {
  const { results, identifier, rowGridTemplateColumns } = props;

  return (
    <div className={styles.tableBody} role='rowgroup'>
      <div>
        {results.length > 0 &&
          results.map((result) => (
            <SubtestsRevisionRow
              key={identifier + result.platform}
              result={result}
              gridTemplateColumns={rowGridTemplateColumns}
            />
          ))}
      </div>
    </div>
  );
}

interface SubtestsTableContentProps {
  results: CompareResultsItem[];
  identifier: string;
  rowGridTemplateColumns: string;
}

export default SubtestsTableContent;
