import { memo } from 'react';

import Box from '@mui/material/Box';

import AgreementChip from './AgreementChip';
import PlatformStatusCell from './PlatformStatusCell';
import type { TestVersion } from '../../../../types/types';
import type {
  PlatformColumnInfo,
  SubtestMatrixRow,
} from '../../../../utils/subtestMatrix';

type SubtestsCrossPlatformRowProps = {
  row: SubtestMatrixRow;
  columns: PlatformColumnInfo[];
  gridTemplateColumns: string;
  testVersion: TestVersion;
  getCellLink: (column: PlatformColumnInfo, test: string) => string;
};

function SubtestsCrossPlatformRow({
  row,
  columns,
  gridTemplateColumns,
  testVersion,
  getCellLink,
}: SubtestsCrossPlatformRowProps) {
  return (
    <Box
      className='matrix-row'
      sx={{ gridTemplateColumns, backgroundColor: 'revisionRow.background' }}
      role='row'
    >
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
          link={getCellLink(column, row.test)}
        />
      ))}
    </Box>
  );
}

export default memo(SubtestsCrossPlatformRow);
