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
import type {
  CompareResultsItem,
  MannWhitneyResultsItem,
} from '../../../types/state';
import { MANN_WHITNEY_U } from '../../../utils/helpers';
import { getBrowserDisplay } from '../../../utils/platform';
import RevisionRowExpandableMannWhitney from '../RevisionRowExpandableMannWhitney';
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
  const { result, gridTemplateColumns, replicates, testVersion } = props;
  const {
    test,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
    is_improvement: improvement,
    is_regression: regression,
    base_runs: baseRuns,
    new_runs: newRuns,
    graphs_link: graphLink,
    base_app: baseApp,
    new_app: newApp,
    new_runs_replicates: newRunsReplicates,
    base_runs_replicates: baseRunsReplicates,
  } = result;

  const baseRunsCount = replicates
    ? baseRunsReplicates.length
    : baseRuns.length;
  const newRunsCount = replicates ? newRunsReplicates.length : newRuns.length;

  const [expanded, setExpanded] = useState(false);

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  const renderAvg = (test_version: string) => {
    if (test_version === MANN_WHITNEY_U) {
      const { base_standard_stats, new_standard_stats } =
        result as MannWhitneyResultsItem;
      const baseMean = base_standard_stats.mean;
      const newMean = new_standard_stats.mean;
      return (
        <>
          <div className='browser-name cell' role='cell'>
            {formatNumber(baseMean)} {baseUnit}
            {getBrowserDisplay(baseApp, newApp, expanded) && (
              <span className={FontSize.xSmall}>({baseApp})</span>
            )}
          </div>
          <div className='comparison-sign cell' role='cell'>
            {determineSign(baseMean, newMean)}
          </div>
          <div className='browser-name cell' role='cell'>
            {formatNumber(baseMean)} {newUnit}
            {getBrowserDisplay(baseApp, newApp, expanded) && (
              <span className={FontSize.xSmall}>({newApp})</span>
            )}
          </div>
        </>
      );
    } else {
      const { base_avg_value: baseAvgValue, new_avg_value: newAvgValue } =
        result as CompareResultsItem;
      return (
        <>
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
        </>
      );
    }
  };
  const renderConfidence = (test_version: string) => {
    if (test_version === MANN_WHITNEY_U) {
      const { cles, cliffs_delta } = result as MannWhitneyResultsItem;
      return (
        <>
          <div className='cliffs delta' role='cell'>
            {' '}
            {cliffs_delta} %{' '}
          </div>
          <div className='cles cell' role='cell'>
            {cles?.effect_size}
          </div>
        </>
      );
    } else {
      const {
        delta_percentage: deltaPercent,
        confidence_text: confidenceText,
      } = result as CompareResultsItem;
      return (
        <>
          <div className='delta cell' role='cell'>
            {' '}
            {deltaPercent} %{' '}
          </div>
          <div className='confidence cell' role='cell'>
            {confidenceText && confidenceIcons[confidenceText]}
            {confidenceText}
          </div>
        </>
      );
    }
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
        {renderAvg(testVersion)}
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
        {renderConfidence(testVersion)}
        <div className='total-runs cell' role='cell'>
          <span>
            <span title='Base runs'>B:</span>
            <strong>{baseRunsCount}</strong>
          </span>
          <span>
            <span title='New runs'>N:</span>
            <strong>{newRunsCount}</strong>
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
      {expanded && testVersion !== MANN_WHITNEY_U && (
        <RevisionRowExpandable id={id} result={result as CompareResultsItem} />
      )}
      {expanded && testVersion === MANN_WHITNEY_U && (
        <RevisionRowExpandableMannWhitney
          id={id}
          result={result as MannWhitneyResultsItem}
        />
      )}
    </>
  );
}

interface RevisionRowProps {
  result: CompareResultsItem | MannWhitneyResultsItem;
  gridTemplateColumns: string;
  replicates: boolean;
  testVersion: string;
}

export default SubtestsRevisionRow;
