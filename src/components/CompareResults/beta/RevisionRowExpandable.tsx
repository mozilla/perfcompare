import Divider from '@mui/material/Divider';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import Distribution from './Distribution';

const strings = Strings.components.expandableRow;
const { singleRun } = strings;

function shouldDisplayGraphDistribution(baseRuns: Array<number>, newRuns: Array<number>): boolean {
  if (baseRuns.length > 1 || newRuns.length > 1)
    return true;
  return false;
}


function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { themeMode, result } = props;
  const { platform, delta_percentage: deltaPercent, delta_value: delta, confidence_text: confidenceText, base_runs: baseRuns, new_runs: newRuns, new_is_better: newIsBetter } = result;
  const shouldDisplayGraph = shouldDisplayGraphDistribution(baseRuns, newRuns);

  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;
  const contentThemeColor =
    themeMode == 'light' ? Colors.SecondaryDefault : Colors.Background100Dark;

  const styles = {
    expandedRow: style({
      backgroundColor: themeColor200,
      padding: Spacing.Medium,
      marginBottom: Spacing.Small,
      width: '100%',
    }),
    content: style({
      backgroundColor: contentThemeColor,
      padding: Spacing.Medium,
    }),
    bottomSpace: style({
      paddingBottom: Spacing.Small,
    }),
    note: style({
      fontSize: '10px',
      textTransform: 'uppercase',
    }),
  }; 

  return (
    <div className={`${styles.expandedRow}`}>
      <div className={`${styles.content}`}>
        <div className={`${styles.bottomSpace}`}><b>{platform}</b> <br /></div>
        {
          shouldDisplayGraph &&
            <div>
              <div className={`${styles.bottomSpace}`}><Divider /> </div>
              <Distribution result={result}/>
            </div>
        }
        <div className={`${styles.bottomSpace}`}><Divider /> </div>
        {!shouldDisplayGraph && <div className={`${styles.bottomSpace}`}>{singleRun}</div> }
        <div className={`${styles.bottomSpace}`}><b>Mean Difference</b>: {deltaPercent}% {newIsBetter ? 'better' : 'worse'} ({delta})</div>
        {
          confidenceText ?
            <div>
                <div><b>Confidence</b>: {confidenceText} </div>
              <div className={styles.note}><b>**NOTE</b>: {strings[confidenceText]} </div>
            </div> :
            <div>
                <div><b>Confidence</b>: Not available </div>
            </div>
        }
      </div>
    </div>
  );
}

interface RevisionRowExpandableProps {
  themeMode: 'light' | 'dark';
  result: CompareResultsItem;
}

export default RevisionRowExpandable;
