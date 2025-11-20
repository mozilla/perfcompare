import { useId, useState, type ReactNode } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import { RetriggerButton } from './Retrigger/RetriggerButton';
import RevisionRowExpandable from './RevisionRowExpandable';
import {
  compareView,
  compareOverTimeView,
  MANN_WHITNEY_U,
  STUDENT_T,
} from '../../common/constants';
import { Strings } from '../../resources/Strings';
import { FontSize, Spacing } from '../../styles';
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
  PlatformShortName,
} from '../../types/state';
import { TestVersion } from '../../types/types';
import { formatNumber } from '../../utils/format';
import { capitalize } from '../../utils/helpers';
import {
  getPlatformShortName,
  getPlatformAndVersion,
  getBrowserDisplay,
} from '../../utils/platform';
import AndroidIcon from '../Shared/Icons/AndroidIcon';
import LinuxIcon from '../Shared/Icons/LinuxIcon';
import SubtestsIcon from '../Shared/Icons/SubtestsIcon';
import WindowsIcon from '../Shared/Icons/WindowsIcon';

const typography = style({
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '1.5',
});

const browserName = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: '10px 0px',
});

const revisionRow = style({
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px 0px 0px`,
  $nest: {
    '.cell': {
      display: 'flex',
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    '.confidence': {
      gap: '10px',
      justifyContent: 'start',
      paddingInlineStart: '15%',
    },
    '.expand-button-container': {
      justifyContent: 'right',
    },
    '.platform': {
      borderRadius: '4px 0 0 4px',
      paddingLeft: Spacing.xLarge,
      justifyContent: 'left',
    },
    '.platform-container': {
      alignItems: 'flex-end',
      display: 'flex',
    },
    '.retrigger-button': {
      borderRadius: '0px 4px 4px 0px',
      cursor: 'not-allowed',
    },
    '.status': {
      justifyContent: 'center',
    },
    '.total-runs': {
      gap: '8px',
    },
    '.row-buttons': {
      borderRadius: '0px 4px 4px 0px',
      display: 'flex',
      justifyContent: 'flex-end',
      $nest: {
        '.download': {
          cursor: 'not-allowed',
        },
      },
    },
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

function determineStatus(improvement: boolean, regression: boolean) {
  if (improvement) return 'Improvement';
  if (regression) return 'Regression';
  return '-';
}

function determineStatusHintClass(improvement: boolean, regression: boolean) {
  if (improvement) return 'status-hint-improvement';
  if (regression) return 'status-hint-regression';
  return '';
}

function determineSign(baseMedianValue: number, newMedianValue: number) {
  if (baseMedianValue > newMedianValue) return '>';
  if (baseMedianValue < newMedianValue) return '<';
  return '';
}

const platformIcons: Record<PlatformShortName, ReactNode> = {
  Linux: <LinuxIcon />,
  macOS: <AppleIcon />,
  iOS: <AppleIcon />,
  Windows: <WindowsIcon />,
  Android: <AndroidIcon />,
  Unspecified: '',
};

const confidenceIcons = {
  Low: <KeyboardArrowDownIcon sx={{ color: 'icons.error' }} />,
  Medium: <DragHandleIcon sx={{ color: 'text.secondary' }} />,
  High: <KeyboardArrowUpIcon sx={{ color: 'icons.success' }} />,
};

const getSubtestsCompareWithBaseLink = (
  result: CompareResultsItem | MannWhitneyResultsItem,
  testVersion: TestVersion,
) => {
  const params = new URLSearchParams({
    baseRev: result.base_rev,
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
    test_version: testVersion,
  });

  return `/subtests-compare-results?${params.toString()}`;
};

const getSubtestsCompareOverTimeLink = (
  result: CompareResultsItem | MannWhitneyResultsItem,
  testVersion: TestVersion,
) => {
  // Fetching the interval value directly from the URL avoids a
  // spurious render due to react-router context changing. It's not usually a
  // problem, but because this component can have a lot of instances, this is a
  // performance problem in our case.
  // If the process of fetching it from the URL is too costly, we might need to
  // pass it down using the props otherwise.
  const currentSearchParams = new URLSearchParams(location.search);
  const interval = currentSearchParams.get('selectedTimeRange');
  if (interval === null) {
    // We should always have it because it's been checked in the loader already.
    // Let's throw if it's absent so that if the loader and URL changes in the
    // future but this path isn't changed, this will be very visible.
    throw new Error(
      "The parameter 'selectedTimeRange' is absent from the search parameters, this should not happen.",
    );
  }

  const params = new URLSearchParams({
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    selectedTimeRange: interval,
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
    test_version: testVersion,
  });

  return `/subtests-compare-over-time-results?${params.toString()}`;
};

function RevisionRow(props: RevisionRowProps) {
  const id = useId();

  const { result, view, gridTemplateColumns, replicates, testVersion } = props;
  const {
    platform,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
    is_improvement: improvement,
    is_regression: regression,
    delta_percentage: deltaPercent,
    confidence_text: confidenceText,
    base_runs: baseRuns,
    new_runs: newRuns,
    graphs_link: graphLink,
    base_app: baseApp,
    new_app: newApp,
    new_runs_replicates: newRunsReplicates,
    base_runs_replicates: baseRunsReplicates,
  } = result;

  const platformShortName = getPlatformShortName(platform);
  const platformIcon = platformIcons[platformShortName];
  const platformNameAndVersion = getPlatformAndVersion(platform);
  const baseRunsCount = replicates
    ? baseRunsReplicates.length
    : baseRuns.length;
  const newRunsCount = replicates ? newRunsReplicates.length : newRuns.length;
  const baseAvgValue =
    testVersion === MANN_WHITNEY_U
      ? ((result as MannWhitneyResultsItem).base_standard_stats?.mean ?? null)
      : (result as CompareResultsItem).base_avg_value;
  const newAvgValue =
    testVersion === MANN_WHITNEY_U
      ? ((result as MannWhitneyResultsItem).new_standard_stats?.mean ?? null)
      : (result as CompareResultsItem).new_avg_value;
  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  // Note that the return type is different depending on the view we're in
  const subtestsCompareLink =
    view === compareView
      ? getSubtestsCompareWithBaseLink(result, testVersion)
      : getSubtestsCompareOverTimeLink(result, testVersion);

  return (
    <>
      <Box
        className={`revisionRow ${revisionRow} ${typography}`}
        sx={{ gridTemplateColumns, backgroundColor: 'revisionRow.background' }}
        role='row'
      >
        <div className='platform cell' role='cell'>
          <Tooltip
            style={{ cursor: 'pointer' }}
            placement='bottom'
            title={platform}
            arrow
          >
            <div className='platform-container'>
              {platformIcon}
              <span>
                {platformNameAndVersion === 'Unspecified'
                  ? platform
                  : platformNameAndVersion}
              </span>
            </div>
          </Tooltip>
        </div>
        {testVersion !== MANN_WHITNEY_U && (
          <>
            <div className={`${browserName} cell`} role='cell'>
              {baseAvgValue
                ? `${formatNumber(baseAvgValue)} ${baseUnit ?? ''}`
                : 'N/A'}
              {getBrowserDisplay(baseApp, newApp, expanded) && (
                <span className={FontSize.xSmall}>({baseApp})</span>
              )}
            </div>
            <div className='comparison-sign cell' role='cell'>
              {baseAvgValue && newAvgValue
                ? determineSign(baseAvgValue, newAvgValue)
                : '  '}
            </div>
            <div className={`${browserName} cell`} role='cell'>
              {newAvgValue
                ? `${formatNumber(newAvgValue)} ${newUnit ?? ''}`
                : 'N/A'}
              {getBrowserDisplay(baseApp, newApp, expanded) && (
                <span className={FontSize.xSmall}>({newApp})</span>
              )}
            </div>
          </>
        )}
        {testVersion === MANN_WHITNEY_U && (
          <>
            <div className={`${browserName} cell`} role='cell'>
              {baseAvgValue ? formatNumber(baseAvgValue) : 'N/A'}{' '}
              {baseUnit ?? ''}
              {getBrowserDisplay(baseApp, newApp, expanded) && (
                <span className={FontSize.xSmall}>({baseApp})</span>
              )}
            </div>
            <div className='comparison-sign cell' role='cell'>
              {baseAvgValue && newAvgValue
                ? determineSign(baseAvgValue, newAvgValue)
                : '  '}
            </div>
            <div className={`${browserName} cell`} role='cell'>
              {newAvgValue ? formatNumber(newAvgValue) : 'N/A'} {newUnit ?? ''}
              {getBrowserDisplay(baseApp, newApp, expanded) && (
                <span className={FontSize.xSmall}>({newApp})</span>
              )}
            </div>
          </>
        )}

        {testVersion === MANN_WHITNEY_U ? (
          <div className='status cell' role='cell'>
            <Box
              sx={{
                bgcolor:
                  (result as MannWhitneyResultsItem).direction_of_change ===
                  'improvement'
                    ? 'status.improvement'
                    : (result as MannWhitneyResultsItem).direction_of_change ===
                        'regression'
                      ? 'status.regression'
                      : 'none',
              }}
              className={`status-hint ${determineStatusHintClass(
                (result as MannWhitneyResultsItem).direction_of_change ===
                  'improvement',
                (result as MannWhitneyResultsItem).direction_of_change ===
                  'regression',
              )}`}
            >
              {capitalize(
                (result as MannWhitneyResultsItem).direction_of_change ?? '',
              )}
            </Box>
          </div>
        ) : (
          <div className='status cell' role='cell'>
            <Box
              sx={{
                bgcolor: improvement
                  ? 'status.improvement'
                  : regression
                    ? 'status.regression'
                    : 'none',
              }}
              className={`status-hint ${determineStatusHintClass(
                !!improvement,
                !!regression,
              )}`}
            >
              {(result as CompareResultsItem).is_improvement ? (
                <ThumbUpIcon color='success' />
              ) : null}
              {(result as CompareResultsItem).is_regression ? (
                <ThumbDownIcon color='error' />
              ) : null}
              {determineStatus(!!improvement, !!regression)}
            </Box>
          </div>
        )}
        <div className='delta cell' role='cell'>
          {' '}
          {testVersion === MANN_WHITNEY_U
            ? ((result as MannWhitneyResultsItem).cliffs_delta ?? 0)
            : ` ${deltaPercent} % `}
        </div>
        {testVersion === MANN_WHITNEY_U ? (
          <div className='p_value cell' role='cell'>
            {(result as MannWhitneyResultsItem).cles?.p_value_cles || '-'}
          </div>
        ) : (
          <div className='confidence cell' role='cell'>
            {confidenceText && confidenceIcons[confidenceText]}
            {confidenceText || '-'}
          </div>
        )}
        {testVersion === MANN_WHITNEY_U && (
          <div className='effects cell' role='cell'>
            {(result as MannWhitneyResultsItem).mann_whitney_test?.pvalue &&
              `${((result as MannWhitneyResultsItem).mann_whitney_test?.pvalue ?? 0) * 100} %`}
          </div>
        )}
        <div className='total-runs cell' role='cell'>
          <span>
            <span title='Base runs'>B:</span>
            <strong>{baseRunsCount}</strong>
          </span>
          <span>
            <span title='New runs'>N:</span>
            <strong>{newRunsCount}</strong>
          </span>
        </div>
        <div className='row-buttons cell'>
          {result.has_subtests && (
            <div className='subtests' role='cell'>
              <div className='subtests-link-button-container'>
                <IconButton
                  title={Strings.components.revisionRow.title.subtestsLink}
                  color='primary'
                  size='small'
                  href={subtestsCompareLink}
                  target='_blank'
                >
                  <SubtestsIcon />
                </IconButton>
              </div>
            </div>
          )}

          <div className='graph' role='cell'>
            <div className='graph-link-button-container'>
              <IconButton
                title={Strings.components.revisionRow.title.graphLink}
                color='primary'
                size='small'
                href={graphLink}
                target='_blank'
              >
                <TimelineIcon />
              </IconButton>
            </div>
          </div>
          <div
            className='retrigger-button'
            role='cell'
            data-testid='retrigger-jobs-button'
          >
            <div className='retrigger-button-container'>
              <RetriggerButton
                result={result as CompareResultsItem}
                variant='icon'
              />
            </div>
          </div>
        </div>
        <Box
          className='cell'
          role='cell'
          sx={{ backgroundColor: 'background.default' }}
        >
          <div
            className='expand-button-container'
            onClick={toggleIsExpanded}
            data-testid='expand-revision-button'
          >
            <IconButton
              title={
                expanded
                  ? Strings.components.expandableRow.title.shrink
                  : Strings.components.expandableRow.title.expand
              }
              color='primary'
              size='small'
              aria-expanded={expanded}
              aria-controls={id}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>
        </Box>
      </Box>
      {expanded && (
        <RevisionRowExpandable
          id={id}
          result={result}
          testVersion={testVersion ?? STUDENT_T}
        />
      )}
    </>
  );
}

interface RevisionRowProps {
  result: CompareResultsItem | MannWhitneyResultsItem;
  gridTemplateColumns: string;
  view: typeof compareView | typeof compareOverTimeView;
  replicates: boolean;
  testVersion: TestVersion;
}

export default RevisionRow;
