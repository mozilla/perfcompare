import { useId, useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';
import { IconButton, Box } from '@mui/material';
import { style } from 'typestyle';

import RevisionRowExpandable from '.././RevisionRowExpandable';
import { MANN_WHITNEY_U } from '../../../common/constants';
import { getStrategy } from '../../../common/testVersions';
import { Strings } from '../../../resources/Strings';
import { Spacing } from '../../../styles';
import type { CombinedResultsItemType } from '../../../types/state';
import { TestVersion } from '../../../types/types';

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
      justifyContent: 'center',
      paddingInlineStart: '15%',
    },
    '.significance': {
      gap: '10px',
      justifyContent: 'left',
    },
    '.subtests': {
      borderRadius: '4px 0 0 4px',
      paddingLeft: Spacing.Medium, // Synchronize with its header
      justifyContent: 'left',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '.subtests-mannwhitney': {
      maxWidth: '150px',
    },

    '.status': {
      justifyContent: 'center',
    },
    '.total-runs': {
      gap: '8px',
      cursor: 'pointer',
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
      padding: '10px 15px',
    },
    'mann-witney-browser-name': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'start',
      flexDirection: 'column',
      padding: '10px 5px',
      maxWidth: '80px',
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

function SubtestsRevisionRow(props: RevisionRowProps) {
  const id = useId();
  const { result, gridTemplateColumns, replicates, testVersion } = props;
  const {
    base_runs: baseRuns,
    new_runs: newRuns,
    graphs_link: graphLink,
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

  const strategy = getStrategy(testVersion ?? MANN_WHITNEY_U);

  return (
    <>
      <Box
        className={`revisionRow ${revisionRow} ${typography}`}
        sx={{ gridTemplateColumns, backgroundColor: 'revisionRow.background' }}
        role='row'
      >
        {strategy.renderSubtestColumns(result, expanded)}
        <div
          className='total-runs cell'
          title={`Base runs: ${baseRunsCount}, New runs: ${newRunsCount}`}
          role='cell'
        >
          <span>
            <span>B:</span>
            <strong>{baseRunsCount}</strong>
          </span>
          <span>
            <span>N:</span>
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
      {expanded && (
        <RevisionRowExpandable
          id={id}
          result={result}
          testVersion={testVersion ?? MANN_WHITNEY_U}
        />
      )}
    </>
  );
}

interface RevisionRowProps {
  result: CombinedResultsItemType;
  gridTemplateColumns: string;
  replicates: boolean;
  testVersion?: TestVersion;
}

export default SubtestsRevisionRow;
