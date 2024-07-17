import { useState, type ReactNode } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing, ExpandableRowStyles } from '../../styles';
import type { CompareResultsItem, PlatformShortName } from '../../types/state';
import { TimeRange } from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';
import AndroidIcon from '../Shared/Icons/AndroidIcon';
import LinuxIcon from '../Shared/Icons/LinuxIcon';
import SubtestsIcon from '../Shared/Icons/SubtestsIcon';
import WindowsIcon from '../Shared/Icons/WindowsIcon';
import type { LoaderReturnValue as WithBaseLoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import RetriggerButton from './Retrigger/RetriggerButton';
import RevisionRowExpandable from './RevisionRowExpandable';

const revisionsRow = {
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px`,
  // Should be kept in sync with the gridTemplateColumns from TableHeader
  gridTemplateColumns: '2fr 1fr 0.2fr 1fr 1fr 1fr 1fr 1fr 2fr 0.2fr',
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

  return `/subtestsCompareWithBase?${params.toString()}`;
};

const getSubtestsCompareOverTimeLink = (
  result: CompareResultsItem,
  interval: TimeRange['value'],
) => {
  const params = new URLSearchParams({
    baseRepo: result.base_repository_name,
    newRev: result.new_rev,
    newRepo: result.new_repository_name,
    framework: String(result.framework_id),
    interval: String(interval),
    baseParentSignature: String(result.base_signature_id),
    newParentSignature: String(result.new_signature_id),
  });

  return `/subtestsCompareOverTime?${params.toString()}`;
};

function RevisionRow(props: RevisionRowProps) {
  const { result } = props;
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
  const loaderData = useLoaderData() as
    | WithBaseLoaderReturnValue
    | OverTimeLoaderReturnValue;
  const subtestsCompareLink =
    loaderData.view === compareView
      ? getSubtestsCompareWithBaseLink(result)
      : getSubtestsCompareOverTimeLink(
          result,
          (loaderData as OverTimeLoaderReturnValue).intervalValue,
        );

  const themeMode = useAppSelector((state) => state.theme.mode);

  const styles = themeMode === 'light' ? stylesLight : stylesDark;

  return (
    <>
      <div
        className={`revisionRow ${styles.revisionRow} ${styles.typography}`}
        role='row'
      >
        <div className='platform cell' role='cell'>
          <div className='platform-container'>
            {platformIcon}
            <span>{platformShortName}</span>
          </div>
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
          {' '}
          {determineStatus(improvement, regression)}{' '}
        </div>
        <div className='delta cell' role='cell'>
          {' '}
          {deltaPercent} %{' '}
        </div>
        <div className='confidence cell' role='cell'>
          {' '}
          {confidenceText}{' '}
        </div>
        <div className='total-runs cell' role='cell'>
          <span>B:</span>
          <strong> {baseRuns.length} </strong> <span> N: </span>
          <strong> {newRuns.length} </strong>
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

          <div className='download' role='cell'>
            <div className='download-button-container'>
              <IconButton
                title={Strings.components.revisionRow.title.downloadProfilers}
                color='primary'
                size='small'
              >
                <FileDownloadOutlinedIcon />
              </IconButton>
            </div>
          </div>
          <div
            className='retrigger-button'
            role='cell'
            data-testid='retrigger-jobs-button'
          >
            <div className='retrigger-button-container'>
              <RetriggerButton result={result} />
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
      </div>
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
}

export default RevisionRow;
