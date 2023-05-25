import Divider from '@mui/material/Divider';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import Distribution from './Distribution';
const strings = Strings.components.expandableRow;


function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { themeMode } = props;

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
        <div className={`${styles.bottomSpace}`}><b>macosx1015-64-shippable-qr</b> <br /></div>
        <div className={`${styles.bottomSpace}`}><Divider /> </div>
        <Distribution />
        <div className={`${styles.bottomSpace}`}><Divider /> </div>
        <div className={`${styles.bottomSpace}`}>{strings.singleRun}</div>
        <div className={`${styles.bottomSpace}`}><b>Mean Difference</b>: 2.5% worse (1,394,293,93)</div>
        <div><b>Confidence</b>: High</div>
        <div className={`${styles.note}`}><b>**NOTE</b>: {strings.note}</div>
      </div>
    </div>
  );
}

interface RevisionRowExpandableProps {
  themeMode: 'light' | 'dark';
}

export default RevisionRowExpandable;
