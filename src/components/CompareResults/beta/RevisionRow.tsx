import { useState } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, TableRow, TableCell } from '@mui/material';
import Link from '@mui/material/Link';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';
import { ExpandableRowStyles } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import RevisionRowExpandable from './RevisionRowExpandable';

interface Expanded {
  expanded: boolean;
  class: string;
}

function capitalizeFirstLetter(text: string | null) {
  if (text != null) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return null;
}

function determineStatus(result: CompareResultsItem) {
  if (result.is_improvement) return 'Improvement';
  if (result.is_regression) return 'Regression';
  return '-';
}

function platformMapping(platform: string) {
  if (platform.includes('linux')) {
    return 'Linux';
  } else if (platform.includes('mac') || platform.includes('osx')) {
    return 'Apple';
  } else if (platform.includes('win')) {
    return 'Windows';
  } else if (platform.includes('android')) {
    return 'Android';
  }
}

function RevisionRow(props: RevisionRowProps) {
  const { themeMode, result } = props;
  const platform = platformMapping(result.platform);

  const [row, setExpanded] = useState<Expanded>({
    expanded: false,
    class: 'default',
  });

  const toggleIsExpanded = () => {
    setExpanded({
      expanded: !row.expanded,
      class: row.expanded ? 'default' : 'expanded',
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
          alignItems: 'center',
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
          <AppleIcon />
          <span>{platform}</span>
        </div>
      </TableCell>
      <TableCell className='base-value'>
        <div className='base-container'> {result.base_median_value} {result.base_measurement_unit} </div>
      </TableCell>
      {/* TODO: Add logic for comparison sign */}
      <TableCell className='comparison-sign'>&gt;</TableCell>
      <TableCell className='new-value'>{result.new_median_value}</TableCell>
      <TableCell className='status'> {determineStatus(result)} </TableCell> 
      <TableCell className='delta'>{result.delta_percentage}%</TableCell>
      <TableCell className='confidence'>{capitalizeFirstLetter(result.confidence_text)}</TableCell>
      <TableCell className='total-runs'>
        <span>B:</span>
        <strong>{result.base_runs.length}</strong> <span>N:</span>
        <strong>{result.new_runs.length}</strong>
      </TableCell>
      <TableCell className='cell-button graph'>
        <div className='graph-link-button-container'>
          <IconButton aria-label='graph link' size='small'>
            <Link href={result.graphs_link} target="_blank" >
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
        <div className='expand-button-container' 
             onClick={toggleIsExpanded}
             data-testid='expand-revision-button'
        >
          <IconButton
            aria-label='expand row'
            size='small'
          >
            {
              row.expanded ?
              <ExpandLessIcon /> :
              <ExpandMoreIcon />
            }
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
    
    <TableRow className={`revisionRow ${styles.revisionRow}`}>
      <TableCell colSpan={11}>
      <div 
          className={`content-row content-row--${row.class} ${stylesCard.container} `}
          data-testid='expanded-row-content'
      >
        <RevisionRowExpandable 
        themeMode={themeMode} 
        result={result}
        />
      </div>
      </TableCell>
    </TableRow>
    
    </>
  );
}

interface RevisionRowProps {
  themeMode: 'light' | 'dark';
  result: CompareResultsItem;
}

export default RevisionRow;
