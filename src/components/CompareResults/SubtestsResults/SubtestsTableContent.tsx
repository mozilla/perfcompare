import SubtestsRevisionRow from './SubtestsRevisionRow';
import type { CompareResultsItem } from '../../../types/state';

function SubtestsTableContent(props: SubtestsTableContentProps) {
  const { results, identifier, rowGridTemplateColumns, replicates } = props;

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
}

export default SubtestsTableContent;
