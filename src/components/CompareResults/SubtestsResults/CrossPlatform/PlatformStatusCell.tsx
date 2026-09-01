import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Link, Tooltip } from '@mui/material';

import { MANN_WHITNEY_U } from '../../../../common/constants';
import { getStrategy } from '../../../../common/testVersions';
import { Strings } from '../../../../resources/Strings';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../../../types/state';
import type { TestVersion } from '../../../../types/types';
import { formatNumber } from '../../../../utils/format';
import { determineStatusHintClass } from '../../../../utils/revisionRowHelpers';
import {
  formatDeltaPct,
  type MatrixCell,
  type PlatformColumnInfo,
} from '../../../../utils/subtestMatrix';

const strings = Strings.components.crossPlatformSubtests;

function formatAvg(value: number | null, unit: string | null): string {
  return value === null ? 'n/a' : `${formatNumber(value)} ${unit ?? ''}`.trim();
}

// The cells are deliberately compact — a matrix with a dozen platforms has no
// room for numbers — so the tooltip carries the detail, and the cell links to
// the single-platform subtests page for the full expandable view.
function cellTooltip(cell: MatrixCell, testVersion: TestVersion): string {
  const { result } = cell;
  const strategy = getStrategy(testVersion);
  const { baseAvg, newAvg } = strategy.getAvgValues(result);
  const lines = [
    result.platform,
    `Base: ${formatAvg(baseAvg, result.base_measurement_unit)} (${
      result.base_runs.length
    } runs)`,
    `New: ${formatAvg(newAvg, result.new_measurement_unit)} (${
      result.new_runs.length
    } runs)`,
  ];

  if (testVersion === MANN_WHITNEY_U) {
    const mwResult = result as MannWhitneyResultsItem;
    const pvalue = mwResult.mann_whitney_test?.pvalue;
    if (pvalue !== null && pvalue !== undefined) {
      lines.push(`p-value: ${pvalue.toPrecision(3)}`);
    }
    if (mwResult.cliffs_delta !== undefined && mwResult.cliffs_delta !== null) {
      lines.push(
        `Cliff's δ: ${mwResult.cliffs_delta.toFixed(2)}${
          mwResult.cliffs_interpretation
            ? ` (${mwResult.cliffs_interpretation})`
            : ''
        }`,
      );
    }
  } else {
    const stResult = result as CompareResultsItem;
    lines.push(`Confidence: ${stResult.confidence_text || 'n/a'}`);
  }

  return lines.join('\n');
}

type PlatformStatusCellProps = {
  cell: MatrixCell | undefined;
  column: PlatformColumnInfo;
  testVersion: TestVersion;
};

function PlatformStatusCell({
  cell,
  column,
  testVersion,
}: PlatformStatusCellProps) {
  if (column.error) {
    return (
      <div className={`platform-cell cell ${column.key}`} role='cell'>
        <WarningIcon
          color='warning'
          fontSize='small'
          titleAccess={strings.platformError(column.platform)}
        />
      </div>
    );
  }

  if (!cell) {
    return (
      <div className={`platform-cell cell ${column.key}`} role='cell'>
        <Box component='span' aria-label={strings.missingCell}>
          —
        </Box>
      </div>
    );
  }

  const isImprovement = cell.status === 'improvement';
  const isRegression = cell.status === 'regression';
  const isNoise = cell.status === 'noise';

  return (
    <div className={`platform-cell cell ${column.key}`} role='cell'>
      <Tooltip
        title={
          <Box component='span' sx={{ whiteSpace: 'pre-line' }}>
            {cellTooltip(cell, testVersion)}
          </Box>
        }
        placement='top'
        arrow
      >
        <Link
          href={cell.link}
          underline='none'
          color='inherit'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {isNoise ? (
            <Box
              className='noise-label'
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: 'text.secondary',
                bgcolor: 'action.hover',
              }}
            >
              {strings.noiseLabel}
            </Box>
          ) : null}
          <Box
            sx={{
              bgcolor: isImprovement
                ? 'status.improvement'
                : isRegression
                  ? 'status.regression'
                  : 'none',
              // Noise is its own status, so the chip is neutral and muted:
              // there is no confirmed direction to advertise.
              opacity: isNoise ? 0.6 : 1,
            }}
            className={`status-hint ${determineStatusHintClass(
              isImprovement,
              isRegression,
            )}`}
          >
            {isImprovement ? <ThumbUpIcon color='success' /> : null}
            {isRegression ? <ThumbDownIcon color='error' /> : null}
            {formatDeltaPct(cell.deltaPct) || '—'}
          </Box>
        </Link>
      </Tooltip>
    </div>
  );
}

export default PlatformStatusCell;
