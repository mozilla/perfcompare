import SubtestsRevisionRow from './SubtestsRevisionRow';
import type { CompareResultsItem } from '../../../types/state';
import { TestVersion } from '../../../types/types';
import { STUDENT_T } from '../../../common/constants';

function SubtestsTableContent(props: SubtestsTableContentProps) {
  const {
    results,
    identifier,
    rowGridTemplateColumns,
    replicates,
    testVersion,
  } = props;

  if (!results.length) {
    return null;
  }

  return (
    <>
      {results.map((result) => (
        <SubtestsRevisionRow
          key={identifier + result.platform}
          result={result}
          gridTemplateColumns={rowGridTemplateColumns}
          replicates={replicates}
          testVersion={testVersion?? STUDENT_T}
        />
      ))}
    </>
  );
}

interface SubtestsTableContentProps {
  results: CompareResultsItem[];
  identifier: string;
  rowGridTemplateColumns: string;
  replicates: boolean;
  testVersion?: TestVersion;
}

export default SubtestsTableContent;
