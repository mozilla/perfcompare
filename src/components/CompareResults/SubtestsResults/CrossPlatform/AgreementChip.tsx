import type { ReactNode } from 'react';

import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import {
  agreementLabels,
  type SubtestMatrixRow,
} from '../../../../utils/subtestMatrix';

// An icon and its count, eg. "👎 4/10".
function Count({ regressed, count }: { regressed: boolean; count: string }) {
  return (
    <span className='agreement-count'>
      {regressed ? (
        <ThumbDownIcon color='error' aria-hidden />
      ) : (
        <ThumbUpIcon color='success' aria-hidden />
      )}
      {count}
    </span>
  );
}

// Compact, like the platform cells. The tooltip and the accessible name spell
// it out.
function chipLabel(row: SubtestMatrixRow): ReactNode {
  const { agreement, improvements, regressions, present, noise } = row;
  switch (agreement) {
    case 'consistent-regression':
    case 'partial-regression':
      return <Count regressed count={`${regressions}/${present}`} />;
    case 'consistent-improvement':
    case 'partial-improvement':
      return <Count regressed={false} count={`${improvements}/${present}`} />;
    case 'mixed':
      return (
        <>
          <Count regressed count={String(regressions)} />
          <Count regressed={false} count={String(improvements)} />
        </>
      );
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
          role='img'
          aria-label={chipTooltip(row)}
          sx={{
            bgcolor: chipColor(row),
            borderRadius: '4px',
            padding: '4px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: consistent ? 700 : 400,
            // Hints at the tooltip with the full breakdown.
            cursor: 'pointer',
            '& .agreement-count': {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            },
            '& .MuiSvgIcon-root': { width: '16px', height: '16px' },
          }}
        >
          {chipLabel(row)}
        </Box>
      </Tooltip>
    </div>
  );
}

export default AgreementChip;
