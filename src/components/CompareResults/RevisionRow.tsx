import { useState } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton } from '@mui/material';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing, ExpandableRowStyles } from '../../styles';
import type { CompareResultsItem, PlatformInfo } from '../../types/state';
import AndroidIcon from '../Shared/Icons/AndroidIcon';
import LinuxIcon from '../Shared/Icons/LinuxIcon';
import WindowsIcon from '../Shared/Icons/WindowsIcon';
import RetriggerButton from './RetriggerButton';
import RevisionRowExpandable from './RevisionRowExpandable';

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

const getPlatformInfo = (platformName: string): PlatformInfo => {
  if (platformName.toLowerCase().includes('linux'))
    return { shortName: 'Linux', icon: <LinuxIcon /> };
  else if (
    platformName.toLowerCase().includes('osx') ||
    platformName.toLowerCase().includes('os x')
  )
    return { shortName: 'OSX', icon: <AppleIcon /> };
  else if (platformName.toLowerCase().includes('windows'))
    return { shortName: 'Windows', icon: <WindowsIcon /> };
  else if (platformName.toLowerCase().includes('android'))
    return { shortName: 'Android', icon: <AndroidIcon /> };
  else
    return {
      shortName: Strings.components.revisionRow.platformUndefinedText,
      icon: '',
    };
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

  const platformInfo = getPlatformInfo(platform);

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const stylesCard = ExpandableRowStyles();

  const themeMode = useAppSelector((state) => state.theme.mode);
  const expandButtonColor =
    themeMode == 'light' ? Colors.Background300 : Colors.Background100Dark;
  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;

  const styles = {
    revisionRow: style({
      borderRadius: '4px 0px 0px 4px',
      display: 'grid',
      margin: `${Spacing.Small}px 0px`,
      // Should be kept in sync with the gridTemplateColumns from TableHeader
      gridTemplateColumns: '2fr 1fr 0.2fr 1fr 1fr 1fr 1fr 1fr 2fr 0.2fr',
      $nest: {
        '.base-value': {
          backgroundColor: themeColor200,
        },
        '.cell': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.confidence': {
          backgroundColor: themeColor200,
        },
        '.comparison-sign': {
          backgroundColor: themeColor200,
        },
        '.delta': {
          backgroundColor: themeColor200,
        },
        '.expand-button-container': {
          justifyContent: 'right',
        },
        '.new-value': {
          backgroundColor: themeColor200,
        },
        '.platform': {
          backgroundColor: themeColor200,
          borderRadius: '4px 0 0 4px',
          paddingLeft: Spacing.xLarge,
          justifyContent: 'left',
        },
        '.platform-container': {
          alignItems: 'flex-end',
          backgroundColor: themeColor200,
          display: 'flex',
        },
        '.retrigger-button': {
          backgroundColor: themeColor200,
          borderRadius: '0px 4px 4px 0px',
          cursor: 'not-allowed',
        },
        '.status': {
          backgroundColor: themeColor200,
          justifyContent: 'center',
        },
        '.total-runs': {
          backgroundColor: themeColor200,
        },

        '.row-buttons': {
          backgroundColor: themeColor200,
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
          backgroundColor: expandButtonColor,
        },
      },
    }),
    typography: style({
      fontFamily: 'SF Pro',
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '13px',
      lineHeight: '16px',
    }),
  };
  return (
    <>
      <div
        className={`revisionRow ${styles.revisionRow} ${styles.typography}`}
        role='row'
      >
        <div className='platform cell' role='cell'>
          <div className='platform-container'>
            {platformInfo.icon}
            <span>{platformInfo.shortName}</span>
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
              <RetriggerButton />
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
