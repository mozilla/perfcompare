import { useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton } from '@mui/material';
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
      '.subtests': {
        backgroundColor: Colors.Background200,
        borderRadius: '4px 0 0 4px',
        paddingLeft: Spacing.xLarge,
        justifyContent: 'left',
      },
      '.subtests-container': {
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
      '.subtests': {
        backgroundColor: Colors.Background200Dark,
        borderRadius: '4px 0 0 4px',
        paddingLeft: Spacing.xLarge,
        justifyContent: 'left',
      },
      '.subtests-container': {
        alignItems: 'flex-end',
        backgroundColor: Colors.Background200Dark,
        display: 'flex',
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

function SubtestsRevisionRow(props: RevisionRowProps) {
  const { result } = props;
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

  const styles = themeMode === 'light' ? stylesLight : stylesDark;

  return (
    <>
      <div
        className={`revisionRow ${styles.revisionRow} ${styles.typography}`}
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

export default SubtestsRevisionRow;
