import Divider from '@mui/material/Divider';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import Distribution from './Distribution';

const strings = Strings.components.expandableRow;
const { singleRun } = strings;

function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { result } = props;
  const {
    platform,
    delta_percentage: deltaPercent,
    delta_value: delta,
    confidence_text: confidenceText,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
    new_is_better: newIsBetter,
    base_app: baseApplication,
    new_app: newApplication,
  } = result;

  const themeMode = useAppSelector((state) => state.theme.mode);
  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;
  const contentThemeColor =
    themeMode == 'light' ? Colors.SecondaryDefault : Colors.Background100Dark;

  const styles = {
    expandedRow: style({
      backgroundColor: themeColor200,
      padding: Spacing.Medium,
      marginBottom: Spacing.Small,
      width: '97%',
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
        <div className={`${styles.bottomSpace}`}>
          <b>{platform}</b> <br />
        </div>
        <div className={`${styles.bottomSpace}`}>
          <Divider />
        </div>
        <Distribution result={result} />
        <div className={`${styles.bottomSpace}`}>
          <Divider />
        </div>
        <div className={`${styles.bottomSpace}`}>
          <div>{singleRun} </div>
          {baseApplication && (
            <div>
              <b>Base application</b>: {baseApplication}{' '}
            </div>
          )}
          {newApplication && (
            <div>
              <b>New application</b>: {newApplication}{' '}
            </div>
          )}
        </div>
        <div className={`${styles.bottomSpace}`}>
          <b>Mean Difference</b>: {deltaPercent}%{' '}
          {newIsBetter ? 'better' : 'worse'} ({delta} {baseUnit || newUnit})
        </div>
        {confidenceText ? (
          <div>
            <div>
              <b>Confidence</b>: {confidenceText}{' '}
            </div>
            <div className={styles.note}>
              <b>**Note</b>: {strings[confidenceText]}{' '}
            </div>
          </div>
        ) : (
          <div>
            <div>
              <b>Confidence</b>: Not available{' '}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface RevisionRowExpandableProps {
  result: CompareResultsItem;
}

export default RevisionRowExpandable;
