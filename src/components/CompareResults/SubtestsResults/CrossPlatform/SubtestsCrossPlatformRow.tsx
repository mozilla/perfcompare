import { style } from 'typestyle';

import AgreementChip from './AgreementChip';
import PlatformStatusCell from './PlatformStatusCell';
import { Spacing } from '../../../../styles';
import type { TestVersion } from '../../../../types/types';
import type {
  PlatformColumnInfo,
  SubtestMatrixRow,
} from '../../../../utils/subtestMatrix';

const matrixRow = style({
  borderRadius: '4px',
  display: 'grid',
  // Keep this gap in sync with the header grid in TableHeader.
  columnGap: `${Spacing.Small}px`,
  margin: `${Spacing.Small}px 0px 0px 0px`,
  alignItems: 'center',
  $nest: {
    '.cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
    },
    '.subtests': {
      justifyContent: 'flex-start',
      paddingLeft: Spacing.Medium, // Synchronize with its header
      wordBreak: 'break-word',
    },
    // Copied from SubtestsRevisionRow so the status chips look identical on
    // both subtests pages.
    '.status-hint': {
      display: 'inline-flex',
      gap: '6px',
      borderRadius: '4px',
      padding: '4px 10px',
      alignItems: 'center',
    },
    '.status-hint .MuiSvgIcon-root': {
      height: '16px',
    },
    '.status-hint-regression .MuiSvgIcon-root': {
      // We need to move the icon a bit lower so that it _looks_ centered.
      marginTop: '2px',
    },
  },
});

type SubtestsCrossPlatformRowProps = {
  row: SubtestMatrixRow;
  columns: PlatformColumnInfo[];
  gridTemplateColumns: string;
  testVersion: TestVersion;
};

function SubtestsCrossPlatformRow({
  row,
  columns,
  gridTemplateColumns,
  testVersion,
}: SubtestsCrossPlatformRowProps) {
  return (
    <div className={matrixRow} style={{ gridTemplateColumns }} role='row'>
      <div className='subtests cell' role='cell'>
        {row.test}
      </div>
      <AgreementChip row={row} />
      {columns.map((column) => (
        <PlatformStatusCell
          key={column.key}
          cell={row.cells.get(column.key)}
          column={column}
          testVersion={testVersion}
        />
      ))}
    </div>
  );
}

export default SubtestsCrossPlatformRow;
