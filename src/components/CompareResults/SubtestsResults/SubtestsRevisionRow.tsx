import { useState } from 'react';

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

import { useAppSelector } from '../../../hooks/app';
import { Strings } from '../../../resources/Strings';
import { Colors, Spacing, ExpandableRowStyles } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import RevisionRowExpandable from '.././RevisionRowExpandable';

const revisionsRow = {
  borderRadius: '4px 0px 0px 4px',
  display: 'grid',
  margin: `${Spacing.Small}px 0px`,
};

const typography = style({
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '16px',
});

function getStyles(themeMode: string) {
  const mainBackgroundColor =
    themeMode === 'light' ? Colors.Background200 : Colors.Background200Dark;
  const backgroundColorExpandButton =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;
  return {
    revisionRow: style({
      ...revisionsRow,
      $nest: {
        '.base-value': {
          backgroundColor: mainBackgroundColor,
        },
        '.cell': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.confidence': {
          backgroundColor: mainBackgroundColor,
          gap: '10px',
          justifyContent: 'start',
          paddingInlineStart: '15%',
        },
        '.comparison-sign': {
          backgroundColor: mainBackgroundColor,
        },
        '.delta': {
          backgroundColor: mainBackgroundColor,
        },
        '.expand-button-container': {
          justifyContent: 'right',
        },
        '.new-value': {
          backgroundColor: mainBackgroundColor,
        },
        '.subtests': {
          backgroundColor: mainBackgroundColor,
          borderRadius: '4px 0 0 4px',
          paddingLeft: Spacing.xLarge,
          justifyContent: 'left',
        },
        '.subtests-container': {
          alignItems: 'flex-end',
          backgroundColor: mainBackgroundColor,
          display: 'flex',
        },
        '.status': {
          backgroundColor: mainBackgroundColor,
          justifyContent: 'center',
        },
        '.total-runs': {
          backgroundColor: mainBackgroundColor,
          gap: '8px',
        },
        '.row-buttons': {
          backgroundColor: mainBackgroundColor,
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
          backgroundColor: backgroundColorExpandButton,
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
    typography: typography,
  };
}

const styles = {
  light: getStyles('light'),
  dark: getStyles('dark'),
};

const stylesCard = ExpandableRowStyles();

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
  const { result, gridTemplateColumns } = props;
  const {
    test,
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
        <div className='subtests cell' role='cell'>
          <div className='subtests-container'>{test}</div>
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
          <div
            className='expand-button-container'
            onClick={toggleIsExpanded}
            data-testid='expand-subtests-row-button'
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
}

export default SubtestsRevisionRow;
