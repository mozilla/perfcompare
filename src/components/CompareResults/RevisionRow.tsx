import { useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, TableRow, TableCell } from '@mui/material';
import Link from '@mui/material/Link';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import { ExpandableRowStyles } from '../../styles';
import type {
  CompareResultsItem,
  PlatformInfo,
  ThemeMode,
} from '../../types/state';
import { getPlatformInfo } from '../../utils/helpers';
import RevisionRowExpandable from './RevisionRowExpandable';

interface Expanded {
  expanded: boolean;
}

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

  const [row, setExpanded] = useState<Expanded>({
    expanded: false,
  });

  const toggleIsExpanded = () => {
    setExpanded({
      expanded: !row.expanded,
    });
  };

  const stylesCard = ExpandableRowStyles();

  const expandButtonColor =
    themeMode == 'light' ? Colors.Background300 : Colors.Background100Dark;
  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;

  const styles = {
    revisionRow: style({
      $nest: {
        '.base-value': {
          backgroundColor: themeColor200,
        },
        '.confidence': {
          backgroundColor: themeColor200,
          textAlign: 'center',
        },
        '.comparison-sign': {
          backgroundColor: themeColor200,
          textAlign: 'center',
        },
        '.delta': {
          backgroundColor: themeColor200,
          textAlign: 'center',
          marginBottom: Spacing.Small,
        },
        '.expand-button-container': {
          textAlign: 'right',
        },
        '.new-value': {
          backgroundColor: themeColor200,
          textAlign: 'center',
        },
        '.platform-container': {
          alignItems: 'flex-end',
          backgroundColor: themeColor200,
          display: 'flex',
        },
        '.retrigger-button': {
          backgroundColor: themeColor200,
          cursor: 'not-allowed',
          textAlign: 'center',
        },
        '.status': {
          backgroundColor: themeColor200,
          textAlign: 'center',
        },
        '.total-runs': {
          backgroundColor: themeColor200,
        },
        '.cell-button': {
          backgroundColor: themeColor200,
          paddingTop: '3px',
          textAlign: 'right',
          width: '16px',
        },
        '.download': {
          cursor: 'not-allowed',
        },
        '.expand-button': {
          backgroundColor: expandButtonColor,
        },
        '.MuiTableCell-root': {
          borderBottom: 'none',
        },
        '.MuiTableCell-root:first-child': {
          borderRadius: '4px 0 0 4px',
          backgroundColor: themeColor200,
        },
        '.MuiTableCell-root:nth-last-child(2)': {
          borderRadius: '0 4px 4px 0',
          backgroundColor: themeColor200,
        },
      },
    }),
  };
  return (
    <>
      <TableRow className={`revisionRow ${styles.revisionRow}`}>
        <TableCell className='platform'>
          <div className='platform-container'>
            <PlatformIcon />
            <div>{platformInfo.shortName}</div>
          </div>
        </TableCell>
        <TableCell className='base-value'>
          <div className='base-container'>
            {' '}
            {baseMedianValue} {baseUnit}{' '}
          </div>
        </TableCell>
        <TableCell className='comparison-sign'>
          {determineSign(baseMedianValue, newMedianValue)}
        </TableCell>
        <TableCell className='new-value'>
          {' '}
          {newMedianValue} {newUnit}
        </TableCell>
        <TableCell className='status'>
          {' '}
          {determineStatus(improvement, regression)}{' '}
        </TableCell>
        <TableCell className='delta'> {deltaPercent} % </TableCell>
        <TableCell className='confidence'> {confidenceText} </TableCell>
        <TableCell className='total-runs'>
          <span>B:</span>
          <strong> {baseRuns.length} </strong> <span> N: </span>
          <strong> {newRuns.length} </strong>
        </TableCell>
        <TableCell className='cell-button graph'>
          <div className='graph-link-button-container'>
            <IconButton aria-label='graph link' size='small'>
              <Link href={graphLink} target='_blank'>
                <TimelineIcon />
              </Link>
            </IconButton>
          </div>
        </TableCell>
        <TableCell className='cell-button download'>
          <div className='download-button-container'>
            <IconButton aria-label='download' size='small'>
              <FileDownloadOutlinedIcon />
            </IconButton>
          </div>
        </TableCell>
        <TableCell className='cell-button retrigger-button'>
          <div className='runs-button-container'>
            <IconButton aria-label='retrigger button' size='small'>
              <RefreshOutlinedIcon />
            </IconButton>
          </div>
        </TableCell>
        <TableCell className='cell-button expand-button'>
          <div
            className='expand-button-container'
            onClick={toggleIsExpanded}
            data-testid='expand-revision-button'
          >
            <IconButton aria-label='expand row' size='small'>
              {row.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className={`revisionRow ${styles.revisionRow}`}>
        <TableCell colSpan={11}>
          <div
            className={`content-row content-row--${
              row.expanded ? 'expanded' : 'default'
            } ${stylesCard.container} `}
            data-testid='expanded-row-content'
          >
            <RevisionRowExpandable themeMode={themeMode} result={result} />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

interface RevisionRowProps {
  themeMode: ThemeMode;
  result: CompareResultsItem;
}

export default RevisionRow;
