import Divider from '@mui/material/Divider';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type { CompareResultsItem } from '../../../types/state';
import Distribution from './Distribution';

const strings = Strings.components.expandableRow;
const { singleRun, note } = strings;


function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { themeMode, result } = props;
  const { platform, delta_percentage: deltaPercent, delta_value: deltaVal, confidence_text: confidenceText } = result;

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
    }),
  }; 

  return (
    <div className={`${styles.expandedRow}`}>
      <div className={`${styles.content}`}>
        <div className={`${styles.bottomSpace}`}><b>{platform}</b> <br /></div>
        <div className={`${styles.bottomSpace}`}><Divider /> </div>
        <Distribution />
        <div className={`${styles.bottomSpace}`}><Divider /> </div>
        {/* TODO: Add logic for single / multiple runs */}
        <div className={`${styles.bottomSpace}`}>{singleRun}</div>
        {/* TODO: Add logic for better / worse */}
        <div className={`${styles.bottomSpace}`}><b>Mean Difference</b>: {deltaPercent}% worse ({deltaVal})</div>
        <div><b>Confidence</b>: {confidenceText} </div>
        <div className={`${styles.note}`}><b>**NOTE</b>: {note}</div>
      </div>
    </div>
  );
}

interface RevisionRowExpandableProps {
  themeMode: 'light' | 'dark';
  result: CompareResultsItem;
}

export default RevisionRowExpandable;
