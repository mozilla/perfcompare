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
    confidence: confidenceValue,
    base_median_value: baseMedian,
    new_median_value: newMedian,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
    base_app: baseApplication,
    new_app: newApplication,
    more_runs_are_needed: moreRunsAreNeeded,
    lower_is_better: lowerIsBetter,
    new_is_better: newIsBetter,
  } = result;

  const unit = baseUnit || newUnit;
  const deltaUnit = unit ? `${unit}` : '';
  let medianDifference = '';
  let medianPercentage = '';
  if (baseMedian && newMedian) {
    medianDifference = (newMedian - baseMedian).toFixed(2);
    medianPercentage = (((newMedian - baseMedian) / baseMedian) * 100).toFixed(
      2,
    );
  }

  const themeMode = useAppSelector((state) => state.theme.mode);
  const themeColor200 =
    themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark;
  const contentThemeColor =
    themeMode == 'light' ? Colors.SecondaryDefault : Colors.Background100Dark;

  const styles = {
    expandedRow: style({
      backgroundColor: themeColor200,
      padding: Spacing.Medium,
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
          {moreRunsAreNeeded && <div>{singleRun} </div>}
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
        <div>
          <b>Comparison result</b>: {newIsBetter ? 'better' : 'worse'} (
          {lowerIsBetter ? 'lower' : 'higher'} is better)
        </div>
        <div>
          <b>Difference of means</b>:{'\u00a0'}
          {deltaPercent}%{'\u00a0'}({delta}
          {deltaUnit ? '\u00a0' + deltaUnit : null})
        </div>
        {newMedian && baseMedian ? (
          <div>
            <b>Difference of medians</b>:{'\u00a0'}
            {medianPercentage}%{'\u00a0'}({medianDifference}
            {deltaUnit ? '\u00a0' + deltaUnit : null})
          </div>
        ) : null}
        {confidenceText ? (
          <div>
            <div>
              <b>Confidence</b>:{'\u00a0'}
              {confidenceText}
              {confidenceValue ? '\u00a0' + `(${confidenceValue})` : null}
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
