import { useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton } from '@mui/material';
import Link from '@mui/material/Link';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import { ExpandableRowStyles } from '../../styles';
import type {
  CompareResultsItem,
  PlatformInfo,
  ThemeMode,
} from '../../types/state';
import { getPlatformInfo } from '../../utils/helpers';
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

function RevisionRow(props: RevisionRowProps) {
  const { themeMode, result } = props;
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

  const platformInfo: PlatformInfo = getPlatformInfo(platform);
  const PlatformIcon = platformInfo.icon as React.ElementType;

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const stylesCard = ExpandableRowStyles();

  const expandButtonColor =
    themeMode == 'light' ? Colors.Background300 : Colors.Background100Dark;
  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;

  const styles = {
    revisionRow: style({
      display: 'grid',
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
          paddingLeft: Spacing.xLarge,
          justifyContent: 'left',
        },
        '.platform-container': {
          alignItems: 'flex-end',
          backgroundColor: themeColor200,
          display: 'flex',
          borderRadius: '4px 0 0 4px',
        },
        '.retrigger-button': {
          backgroundColor: themeColor200,
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
      <div className={`revisionRow ${styles.revisionRow} ${styles.typography}`}>
        <div className='platform cell'>
          <div className='platform-container'>
            {platformInfo.shortName ? (
              <PlatformIcon />
            ) : (
              Strings.components.revisionRow.platformUndefinedText
            )}
            <span>{platformInfo.shortName}</span>
          </div>
        </div>
        <div className='base-value cell'>
          {' '}
          {baseMedianValue} {baseUnit}{' '}
        </div>
        <div className='comparison-sign cell'>
          {determineSign(baseMedianValue, newMedianValue)}
        </div>
        <div className='new-value cell'>
          {' '}
          {newMedianValue} {newUnit}
        </div>
        <div className='status cell'>
          {' '}
          {determineStatus(improvement, regression)}{' '}
        </div>
        <div className='delta cell'> {deltaPercent} % </div>
        <div className='confidence cell'> {confidenceText} </div>
        <div className='total-runs cell'>
          <span>B:</span>
          <strong> {baseRuns.length} </strong> <span> N: </span>
          <strong> {newRuns.length} </strong>
        </div>
        <div className='row-buttons cell'>
          <div className='graph'>
            <div className='graph-link-button-container'>
              <IconButton aria-label='graph link' size='small'>
                <Link href={graphLink} target='_blank'>
                  <TimelineIcon />
                </Link>
              </IconButton>
            </div>
          </div>

          <div className='download'>
            <div className='download-button-container'>
              <IconButton aria-label='download' size='small'>
                <FileDownloadOutlinedIcon />
              </IconButton>
            </div>
          </div>
          <div className='retrigger-button'>
            <div className='runs-button-container'>
              <IconButton aria-label='retrigger button' size='small'>
                <RefreshOutlinedIcon />
              </IconButton>
            </div>
          </div>
        </div>
        <div className='expand-button cell'>
          <div
            className='expand-button-container'
            onClick={toggleIsExpanded}
            data-testid='expand-revision-button'
          >
            <IconButton aria-label='expand row' size='small'>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>
        </div>
      </div>

      <div
        className={`content-row content-row--${
          expanded ? 'expanded' : 'default'
        } ${stylesCard.container} `}
        data-testid='expanded-row-content'
      >
        <RevisionRowExpandable themeMode={themeMode} result={result} />
      </div>
    </>
  );
}

interface RevisionRowProps {
  themeMode: ThemeMode;
  result: CompareResultsItem;
}

export default RevisionRow;
