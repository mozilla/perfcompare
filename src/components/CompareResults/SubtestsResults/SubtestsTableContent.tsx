import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
// import type { CompareResultsItem, RevisionsHeader } from '../../../types/state';
// import SubtestsRevisionHeader from './SubtestsRevisionHeader';
import SubtestsRevisionRow from './SubtestsRevisionRow';

const styles = {
  tableBody: style({
    marginTop: Spacing.Large,
  }),
};

function SubtestsTableContent(props: SubtestsTableContentProps) {
  const { results, identifier } = props;
  //   const { results, header, identifier } = props;

  return (
    <div className={styles.tableBody} role='rowgroup'>
      {/* <SubtestsRevisionHeader header={header} /> */}
      <div>
        {results.length > 0 &&
          results.map((result) => (
            <SubtestsRevisionRow
              key={identifier + result.platform}
              result={result}
            />
          ))}
      </div>
    </div>
  );
}

interface SubtestsTableContentProps {
  results: CompareResultsItem[];
  //   header: RevisionsHeader;
  identifier: string;
}

export default SubtestsTableContent;
