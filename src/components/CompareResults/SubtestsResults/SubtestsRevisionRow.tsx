import { useId, useState } from 'react';

import DragHandleIcon from '@mui/icons-material/DragHandle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, Box } from '@mui/material';
import { style } from 'typestyle';

import RevisionRowExpandable from '.././RevisionRowExpandable';
import { Strings } from '../../../resources/Strings';
import { FontSize, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import { getBrowserDisplay } from '../../../utils/platform';
import { formatNumber } from './../../../utils/format';

const revisionRow = style({
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px 0px 0px`,
  alignItems: 'center',
  $nest: {
    '.cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
    },
    '.confidence': {
      gap: '10px',
      justifyContent: 'start',
      paddingInlineStart: '15%',
    },
    '.subtests': {
      borderRadius: '4px 0 0 4px',
      paddingLeft: Spacing.Medium, // Synchronize with its header
      justifyContent: 'left',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
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
    '.browser-name': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '10px 0px',
    },
  },
});

const typography = style({
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '16px',
  whiteSpace: 'nowrap',
  lineHeight: '1.5',
});

const confidenceIcons = {
  Low: <KeyboardArrowDownIcon sx={{ color: 'icons.error' }} />,
  Medium: <DragHandleIcon sx={{ color: 'text.secondary' }} />,
  High: <KeyboardArrowUpIcon sx={{ color: 'icons.success' }} />,
};

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

function SubtestsRevisionRow(props: RevisionRowProps) {
  const id = useId();
  const { result, gridTemplateColumns } = props;
  const {
    test,
    base_avg_value: baseAvgValue,
    base_measurement_unit: baseUnit,
    new_avg_value: newAvgValue,
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
  } = result;

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Box
        className={`revisionRow ${revisionRow} ${typography}`}
        sx={{ gridTemplateColumns, backgroundColor: 'revisionRow.background' }}
        role='row'
      >
        <div title={test} className='subtests' role='cell'>
          {test}
        </div>
        <div className='browser-name cell' role='cell'>
          {formatNumber(baseAvgValue)} {baseUnit}
          {getBrowserDisplay(baseApp, newApp, expanded) && (
            <span className={FontSize.xSmall}>({baseApp})</span>
          )}
        </div>
        <div className='comparison-sign cell' role='cell'>
          {determineSign(baseAvgValue, newAvgValue)}
        </div>
        <div className='browser-name cell' role='cell'>
          {formatNumber(newAvgValue)} {newUnit}
          {getBrowserDisplay(baseApp, newApp, expanded) && (
            <span className={FontSize.xSmall}>({newApp})</span>
          )}
        </div>
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
              improvement,
              regression,
            )}`}
          >
            {improvement ? <ThumbUpIcon color='success' /> : null}
            {regression ? <ThumbDownIcon color='error' /> : null}
            {determineStatus(improvement, regression)}
          </Box>
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
        </div>
        <Box
          className='cell'
          role='cell'
          sx={{ backgroundColor: 'background.default' }}
        >
          <IconButton
            title={
              expanded
                ? Strings.components.expandableRow.title.shrink
                : Strings.components.expandableRow.title.expand
            }
            color='primary'
            size='small'
            onClick={toggleIsExpanded}
            aria-expanded={expanded}
            aria-controls={id}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      {expanded && <RevisionRowExpandable id={id} result={result} />}
    </>
  );
}

interface RevisionRowProps {
  result: CompareResultsItem;
  gridTemplateColumns: string;
}

export default SubtestsRevisionRow;
