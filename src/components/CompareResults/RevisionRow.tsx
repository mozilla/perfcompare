import { useState, type ReactNode } from 'react';

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

import { compareView, compareOverTimeView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing, ExpandableRowStyles } from '../../styles';
import type { CompareResultsItem, PlatformShortName } from '../../types/state';
import { getPlatformShortName } from '../../utils/platform';
import AndroidIcon from '../Shared/Icons/AndroidIcon';
import LinuxIcon from '../Shared/Icons/LinuxIcon';
import SubtestsIcon from '../Shared/Icons/SubtestsIcon';
import WindowsIcon from '../Shared/Icons/WindowsIcon';
import RetriggerButton from './Retrigger/RetriggerButton';
import RevisionRowExpandable from './RevisionRowExpandable';

const revisionsRow = {
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px`,
};

const typography = {
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '16px',
};

const stylesLight = {
  revisionRow: style({
    ...revisionsRow,
    $nest: {
      '.base-value': {
        backgroundColor: Colors.Background200,
      },
      '.cell': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      '.confidence': {
        backgroundColor: Colors.Background200,
        gap: '10px',
        justifyContent: 'start',
        paddingInlineStart: '15%',
      },
      '.comparison-sign': {
        backgroundColor: Colors.Background200,
      },
      '.delta': {
        backgroundColor: Colors.Background200,
      },
      '.expand-button-container': {
        justifyContent: 'right',
      },
      '.new-value': {
        backgroundColor: Colors.Background200,
      },
      '.platform': {
        backgroundColor: Colors.Background200,
        borderRadius: '4px 0 0 4px',
        paddingLeft: Spacing.xLarge,
        justifyContent: 'left',
      },
      '.platform-container': {
        alignItems: 'flex-end',
        backgroundColor: Colors.Background200,
        display: 'flex',
      },
      '.retrigger-button': {
        backgroundColor: Colors.Background200,
        borderRadius: '0px 4px 4px 0px',
        cursor: 'not-allowed',
      },
      '.status': {
        backgroundColor: Colors.Background200,
        justifyContent: 'center',
      },
      '.total-runs': {
        backgroundColor: Colors.Background200,
        gap: '8px',
      },
      '.row-buttons': {
        backgroundColor: Colors.Background200,
        borderRadius: '0px 4px 4px 0px',
        display: 'flex',
        justifyContent: 'flex-end',
        $nest: {
          '.download': {
            cursor: 'not-allowed',
          },
        },
      },
      '.expand-button': {
        backgroundColor: Colors.Background300,
      },
      '.status-hint': {
        display: 'inline-flex',
        gap: '6px',
        borderRadius: '4px',
        padding: '4px 10px',
      },
      '.status-hint-improvement': {
        backgroundColor: '#D8EEDC',
      },
      '.status-hint-regression': {
        backgroundColor: '#FFE8E8',
      },
      '.status-hint .MuiSvgIcon-root': {
        height: '16px',
      },
      '.status-hint-improvement .MuiSvgIcon-root': {
        color: '#017A40',
      },
      '.status-hint-regression .MuiSvgIcon-root': {
        // We need to move the icon a bit lower so that it _looks_ centered.
        marginTop: '2px',
        color: '#D7264C',
      },
    },
  }),
  typography: style({
    ...typography,
  }),
};

const stylesDark = {
  revisionRow: style({
    ...revisionsRow,
    $nest: {
      '.base-value': {
        backgroundColor: Colors.Background200Dark,
      },
      '.cell': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      '.confidence': {
        backgroundColor: Colors.Background200Dark,
        gap: '10px',
        justifyContent: 'start',
        paddingInlineStart: '15%',
      },
      '.comparison-sign': {
        backgroundColor: Colors.Background200Dark,
      },
      '.delta': {
        backgroundColor: Colors.Background200Dark,
      },
      '.expand-button-container': {
        justifyContent: 'right',
      },
      '.new-value': {
        backgroundColor: Colors.Background200Dark,
      },
      '.platform': {
        backgroundColor: Colors.Background200Dark,
        borderRadius: '4px 0 0 4px',
        paddingLeft: Spacing.xLarge,
        justifyContent: 'left',
      },
      '.platform-container': {
        alignItems: 'flex-end',
        backgroundColor: Colors.Background200Dark,
        display: 'flex',
      },
      '.retrigger-button': {
        backgroundColor: Colors.Background200Dark,
        borderRadius: '0px 4px 4px 0px',
        cursor: 'not-allowed',
      },
      '.status': {
        backgroundColor: Colors.Background200Dark,
        justifyContent: 'center',
      },
      '.total-runs': {
        backgroundColor: Colors.Background200Dark,
        gap: '8px',
      },
      '.row-buttons': {
        backgroundColor: Colors.Background200Dark,
        borderRadius: '0px 4px 4px 0px',
        display: 'flex',
        justifyContent: 'flex-end',
        $nest: {
          '.download': {
            cursor: 'not-allowed',
          },
        },
      },
      '.expand-button': {
        backgroundColor: Colors.Background100Dark,
      },
      '.status-hint': {
        display: 'inline-flex',
        gap: '4px',
        borderRadius: '4px',
        padding: '4px 10px',
      },
      '.status-hint-improvement': {
        backgroundColor: '#004725',
        marginTop: '2px',
      },
      '.status-hint-regression': {
        backgroundColor: '#690F22',
      },
      '.status-hint .MuiSvgIcon-root': {
        height: '16px',
      },
      '.status-hint-improvement .MuiSvgIcon-root': {
        color: '#4DBC87',
      },
      '.status-hint-regression .MuiSvgIcon-root': {
        // We need to move the icon a bit lower so that it _looks_ centered.
        marginTop: '2px',
        color: '#F37F98',
      },
    },
  }),
  typography: style({
    ...typography,
  }),
};

const stylesCard = ExpandableRowStyles();

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
  OSX: <AppleIcon />,
  Windows: <WindowsIcon />,
  Android: <AndroidIcon />,
  Unspecified: '',
};

const confidenceIcons = {
  Low: <KeyboardArrowDownIcon sx={{ color: '#D7264C' }} />,
  Medium: <DragHandleIcon sx={{ color: '#5B5B66' }} />,
  High: <KeyboardArrowUpIcon sx={{ color: '#017A40' }} />,
};

const getSubtestsCompareWithBaseLink = (result: CompareResultsItem) => {
  const params = new URLSearchParams({
    baseRev: result.base_rev,
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
  });

  return `/subtests-compare-results?${params.toString()}`;
};

const getSubtestsCompareOverTimeLink = (result: CompareResultsItem) => {
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
  });

  return `/subtests-compare-over-time-results?${params.toString()}`;
};

function RevisionRow(props: RevisionRowProps) {
  const { result, view, gridTemplateColumns } = props;
  const {
    platform,
    base_median_value: baseMedianValue,
    base_measurement_unit: baseUnit,
    new_median_value: newMedianValue,
    new_measurement_unit: newUnit,
    is_improvement: improvement,
    is_regression: regression,
    delta_percentage: deltaPercent,
    confidence_text: confidenceText,
    base_runs: baseRuns,
    new_runs: newRuns,
    graphs_link: graphLink,
  } = result;

  const platformShortName = getPlatformShortName(platform);
  const platformIcon = platformIcons[platformShortName];

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  // Note that the return type is different depending on the view we're in
  const subtestsCompareLink =
    view === compareView
      ? getSubtestsCompareWithBaseLink(result)
      : getSubtestsCompareOverTimeLink(result);

  const themeMode = useAppSelector((state) => state.theme.mode);

  const styles = themeMode === 'light' ? stylesLight : stylesDark;

  return (
    <>
      <Box
        className={`revisionRow ${styles.revisionRow} ${styles.typography}`}
        sx={{ gridTemplateColumns }}
        role='row'
      >
        <div className='platform cell' role='cell'>
          <Tooltip placement='bottom' title={platform} arrow>
            <div className='platform-container'>
              {platformIcon}
              <span>{platformShortName}</span>
            </div>
          </Tooltip>
        </div>
        <div className='base-value cell' role='cell'>
          {' '}
          {baseMedianValue} {baseUnit}{' '}
        </div>
        <div className='comparison-sign cell' role='cell'>
          {determineSign(baseMedianValue, newMedianValue)}
        </div>
        <div className='new-value cell' role='cell'>
          {' '}
          {newMedianValue} {newUnit}
        </div>
        <div className='status cell' role='cell'>
          <span
            className={`status-hint ${determineStatusHintClass(
              improvement,
              regression,
            )}`}
          >
            {improvement ? <ThumbUpIcon /> : null}
            {regression ? <ThumbDownIcon /> : null}
            {determineStatus(improvement, regression)}
          </span>
        </div>
        <div className='delta cell' role='cell'>
          {' '}
          {deltaPercent} %{' '}
        </div>
        <div className='confidence cell' role='cell'>
          {confidenceText && confidenceIcons[confidenceText]}
          {confidenceText}
        </div>
        <div className='total-runs cell' role='cell'>
          <span>
            <span title='Base runs'>B:</span>
            <strong>{baseRuns.length}</strong>
          </span>
          <span>
            <span title='New runs'>N:</span>
            <strong>{newRuns.length}</strong>
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
              <RetriggerButton result={result} variant='icon' />
            </div>
          </div>
        </div>
        <div className='expand-button cell' role='cell'>
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
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>
        </div>
      </Box>
      {expanded && (
        <div
          className={`content-row ${stylesCard.container}`}
          data-testid='expanded-row-content'
        >
          <RevisionRowExpandable result={result} />
        </div>
      )}
    </>
  );
}

interface RevisionRowProps {
  result: CompareResultsItem;
  gridTemplateColumns: string;
  view: typeof compareView | typeof compareOverTimeView;
}

export default RevisionRow;
