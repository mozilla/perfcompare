import { useState } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, TableRow, TableCell } from '@mui/material';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../../styles';
import { ExpandableRowStyles } from '../../../styles';
import RevisionRowExpandable from './RevisionRowExpandable';

interface Expanded {
  expanded: boolean;
  class: string;
}

function RevisionRow(props: RevisionRowProps) {
  const { themeMode } = props;

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
          <span>Apple</span>
        </div>
      </TableCell>
      <TableCell className='base-value'>
        <div className='base-container'>771.39ms</div>
      </TableCell>
      <TableCell className='comparison-sign'>&gt;</TableCell>
      <TableCell className='new-value'>771.39ms</TableCell>
      <TableCell className='status'>Improvement</TableCell>
      <TableCell className='delta'>2.5%</TableCell>
      <TableCell className='confidence'>High</TableCell>
      <TableCell className='total-runs'>
        <span>B:</span>
        <strong>23</strong> <span>N:</span>
        <strong>27</strong>
      </TableCell>
      <TableCell className='cell-button graph'>
        <div className='graph-link-button-container'>
          <IconButton aria-label='graph link' size='small'>
            <TimelineIcon />
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
        <RevisionRowExpandable themeMode={themeMode}/>
      </div>
      </TableCell>
    </TableRow>
    
    </>
  );
}

interface RevisionRowProps {
  themeMode: 'light' | 'dark';
}

export default RevisionRow;
