import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import type {
  CompareResultsItem,
  RevisionsHeader,
  ThemeMode,
} from '../../types/state';
import RevisionHeaderGrid from './RevisionHeaderGrid';
import RevisionRowGrid from './RevisionRowGrid';

function TableContentGrid(props: TableContentGridProps) {
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
      <RevisionHeaderGrid header={header} />
      <div>
        {results.length > 0 &&
          results.map((result, index) => (
            <RevisionRowGrid
              themeMode={themeMode}
              key={index}
              result={result}
            />
          ))}
      </div>
    </div>
  );
}

interface TableContentGridProps {
  themeMode: ThemeMode;
  results: CompareResultsItem[];
  header: RevisionsHeader;
}

export default TableContentGrid;
