import SubtestsRevisionRow from './SubtestsRevisionRow';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../../types/state';

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
          testVersion={testVersion}
        />
      ))}
    </>
  );
}

interface SubtestsTableContentProps {
  results: (CompareResultsItem | MannWhitneyResultsItem)[];
  identifier: string;
  rowGridTemplateColumns: string;
  replicates: boolean;
  testVersion: string;
}

export default SubtestsTableContent;
