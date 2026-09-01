import { Box, Tooltip } from '@mui/material';

import type { SubtestMatrixRow } from '../../../../utils/subtestMatrix';

// Summarizes how consistently a subtest moved across the platforms that
// reported it, which is the whole point of this table: a change confirmed by
// several platforms is far more trustworthy than one seen on a single one.
function agreementLabel(row: SubtestMatrixRow): string {
  switch (row.agreement) {
    case 'all-improved':
    case 'mostly-improved':
      return `${row.improvements}/${row.present} ▲`;
    case 'all-regressed':
    case 'mostly-regressed':
      return `${row.regressions}/${row.present} ▼`;
    case 'mixed':
      return `Mixed ${row.improvements}▲ ${row.regressions}▼`;
    default:
      return row.present > 0 && row.noise === row.present ? 'Noise' : '—';
  }
}

function agreementColor(row: SubtestMatrixRow): string | undefined {
  switch (row.agreement) {
    case 'all-improved':
    case 'mostly-improved':
      return 'status.improvement';
    case 'all-regressed':
    case 'mostly-regressed':
      return 'status.regression';
    case 'mixed':
      return 'action.hover';
    default:
      return undefined;
  }
}

function agreementTooltip(row: SubtestMatrixRow): string {
  const missing = row.totalPlatforms - row.present;
  const parts = [
    `${row.improvements} improved`,
    `${row.regressions} regressed`,
    `${row.unchanged} unchanged`,
  ];
  if (row.noise) {
    parts.push(`${row.noise} noise`);
  }
  if (missing) {
    parts.push(`${missing} missing`);
  }
  return `${row.test}: ${parts.join(', ')} (out of ${row.totalPlatforms} platforms).`;
}

function AgreementChip({ row }: { row: SubtestMatrixRow }) {
  return (
    <div className='agreement cell' role='cell'>
      <Tooltip title={agreementTooltip(row)} placement='top' arrow>
        <Box
          className='agreement-chip'
          sx={{
            bgcolor: agreementColor(row) ?? 'none',
            borderRadius: '4px',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          {agreementLabel(row)}
        </Box>
      </Tooltip>
    </div>
  );
}

export default AgreementChip;
