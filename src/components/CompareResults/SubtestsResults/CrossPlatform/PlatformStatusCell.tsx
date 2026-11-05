import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

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
import type {
  MatrixCell,
  MatrixCellStatus,
  PlatformColumnInfo,
} from '../../../../utils/subtestMatrix';

const strings = Strings.components.crossPlatformSubtests;

const statusText: Record<MatrixCellStatus, string> = {
  improvement: 'Improvement',
  regression: 'Regression',
  noise: 'Noise',
  none: 'No change',
};

function formatAvg(value: number | null, unit: string | null): string {
  return value === null ? 'N/A' : `${formatNumber(value)} ${unit ?? ''}`.trim();
}

// The cells only fit the direction and the delta; the rest goes here.
function cellTooltipLines(cell: MatrixCell, testVersion: TestVersion) {
  const { result } = cell;
  const { baseAvg, newAvg } = getStrategy(testVersion).getAvgValues(result);
  const lines = [
    result.platform,
    `Base: ${formatAvg(baseAvg, result.base_measurement_unit)} (${result.base_runs.length} runs)`,
    `New: ${formatAvg(newAvg, result.new_measurement_unit)} (${result.new_runs.length} runs)`,
  ];

  if (testVersion === MANN_WHITNEY_U) {
    const { mann_whitney_test, cliffs_delta, cliffs_interpretation } =
      result as MannWhitneyResultsItem;
    if (typeof mann_whitney_test?.pvalue === 'number') {
      lines.push(`p-value: ${mann_whitney_test.pvalue.toPrecision(3)}`);
    }
    if (typeof cliffs_delta === 'number') {
      const interpretation = cliffs_interpretation
        ? ` (${cliffs_interpretation})`
        : '';
      lines.push(`Cliff's δ: ${cliffs_delta.toFixed(2)}${interpretation}`);
    }
  } else {
    const { confidence_text } = result as CompareResultsItem;
    lines.push(`Confidence: ${confidence_text || 'N/A'}`);
  }

  return lines.join('\n');
}

type PlatformStatusCellProps = {
  cell: MatrixCell | undefined;
  column: PlatformColumnInfo;
  testVersion: TestVersion;
  link: string;
};

function PlatformStatusCell({
  cell,
  column,
  testVersion,
  link,
}: PlatformStatusCellProps) {
  if (column.error) {
    return (
      <div className='platform-cell cell' role='cell'>
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
      <div className='platform-cell cell' role='cell'>
        <span role='img' aria-label={strings.missingCell}>
          —
        </span>
      </div>
    );
  }

  const { status, deltaPct } = cell;
  const isImprovement = status === 'improvement';
  const isRegression = status === 'regression';
  const delta =
    deltaPct === null ? '—' : getStrategy(testVersion).formatDeltaPct(deltaPct);

  return (
    <div className='platform-cell cell' role='cell'>
      <Tooltip
        title={
          <Box component='span' sx={{ whiteSpace: 'pre-line' }}>
            {cellTooltipLines(cell, testVersion)}
          </Box>
        }
        placement='top'
        arrow
      >
        <Link
          href={link}
          underline='none'
          color='inherit'
          aria-label={`${column.label}: ${statusText[status]} ${delta}`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {status === 'noise' && (
            <Box component='span' className='noise-label'>
              {statusText.noise}
            </Box>
          )}
          <Box
            className={`status-hint ${determineStatusHintClass(
              isImprovement,
              isRegression,
            )}`}
            sx={{
              bgcolor: isImprovement
                ? 'status.improvement'
                : isRegression
                  ? 'status.regression'
                  : 'none',
              color: status === 'noise' ? 'text.secondary' : undefined,
            }}
          >
            {isImprovement ? <ThumbUpIcon color='success' /> : null}
            {isRegression ? <ThumbDownIcon color='error' /> : null}
            {delta}
          </Box>
        </Link>
      </Tooltip>
    </div>
  );
}

export default PlatformStatusCell;
