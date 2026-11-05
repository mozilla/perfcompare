import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import {
  agreementLabels,
  type SubtestMatrixRow,
} from '../../../../utils/subtestMatrix';

function chipLabel(row: SubtestMatrixRow): string {
  const { agreement, improvements, regressions, present, noise } = row;
  switch (agreement) {
    case 'consistent-regression':
    case 'partial-regression':
      return `${regressions}/${present} regressed`;
    case 'consistent-improvement':
    case 'partial-improvement':
      return `${improvements}/${present} improved`;
    case 'mixed':
      return `${regressions} regressed, ${improvements} improved`;
    default:
      return present > 0 && noise === present ? 'Noise' : 'No change';
  }
}

function chipColor(row: SubtestMatrixRow): string {
  if (row.regressions && !row.improvements) return 'status.regression';
  if (row.improvements && !row.regressions) return 'status.improvement';
  return row.agreement === 'mixed' ? 'action.hover' : 'transparent';
}

function chipTooltip(row: SubtestMatrixRow): string {
  const missing = row.totalPlatforms - row.present;
  const parts = [
    `${row.regressions} regressed`,
    `${row.improvements} improved`,
    `${row.unchanged} unchanged`,
  ];
  if (row.noise) parts.push(`${row.noise} noise`);
  if (missing) parts.push(`${missing} not reported`);
  return `${agreementLabels[row.agreement]}: ${parts.join(', ')}.`;
}

function AgreementChip({ row }: { row: SubtestMatrixRow }) {
  const consistent = row.agreement.startsWith('consistent');
  return (
    <div className='agreement cell' role='cell'>
      <Tooltip title={chipTooltip(row)} placement='top' arrow>
        <Box
          component='span'
          className={`agreement-chip agreement-${row.agreement}`}
          tabIndex={0}
          sx={{
            bgcolor: chipColor(row),
            borderRadius: '4px',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
            fontWeight: consistent ? 700 : 400,
          }}
        >
          {chipLabel(row)}
        </Box>
      </Tooltip>
    </div>
  );
}

export default AgreementChip;
