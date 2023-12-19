import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import type {
  CompareResultsItem,
  RevisionsHeader,
  ThemeMode,
} from '../../types/state';
import RevisionHeader from './RevisionHeader';
import RevisionRow from './RevisionRow';

function TableContent(props: TableContentProps) {
  const { themeMode, results, header } = props;

  const styles = {
    tableBody: style({
      marginTop: Spacing.Large,
      $nest: {
        '.revisionRow': {
          backgroundColor: Colors.Background200,
          margin: `${Spacing.Small}px 0px`,
        },
      },
    }),
  };
  return (
    <div className={styles.tableBody}>
      <RevisionHeader header={header} />
      <div>
        {results.length > 0 &&
          results.map((result, index) => (
            <RevisionRow themeMode={themeMode} key={index} result={result} />
          ))}
      </div>
    </div>
  );
}

interface TableContentProps {
  themeMode: ThemeMode;
  results: CompareResultsItem[];
  header: RevisionsHeader;
}

export default TableContent;
