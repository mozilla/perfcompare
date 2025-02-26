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
import { useAppSelector } from '../../../hooks/app';
import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import { formatNumber } from './../../../utils/format';

const revisionsRow = {
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px 0px 0px`,
  alignItems: 'center',
};

const typography = style({
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '1.5',
});

function getStyles(themeMode: string) {
  const mainBackgroundColor =
    themeMode === 'light' ? Colors.Background200 : Colors.Background200Dark;
  const backgroundColorExpandButton =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  return {
    revisionRow: style({
      ...revisionsRow,
      backgroundColor: mainBackgroundColor,
      $nest: {
        '.cell': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        '.expand-button': {
          backgroundColor: backgroundColorExpandButton,
        },
        '.status-hint': {
          display: 'inline-flex',
          gap: '6px',
          borderRadius: '4px',
          padding: '4px 10px',
        },

        '.status-hint .MuiSvgIcon-root': {
          height: '16px',
        },

        '.status-hint-regression .MuiSvgIcon-root': {
          // We need to move the icon a bit lower so that it _looks_ centered.
          marginTop: '2px',
        },
      },
    }),
    typography: typography,
  };
}

const styles = {
  light: getStyles('light'),
  dark: getStyles('dark'),
};

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
  } = result;

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const themeMode = useAppSelector((state) => state.theme.mode);

  return (
    <>
      <Box
        className={`revisionRow ${styles[themeMode].revisionRow} ${styles[themeMode].typography}`}
        sx={{ gridTemplateColumns }}
        role='row'
      >
        <div title={test} className='subtests' role='cell'>
          {test}
        </div>
        <div className='base-value cell' role='cell'>
          {' '}
          {formatNumber(baseAvgValue)} {baseUnit}{' '}
        </div>
        <div className='comparison-sign cell' role='cell'>
          {determineSign(baseAvgValue, newAvgValue)}
        </div>
        <div className='new-value cell' role='cell'>
          {' '}
          {formatNumber(newAvgValue)} {newUnit}
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
        <div className='expand-button cell' role='cell'>
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
        </div>
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
