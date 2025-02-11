import Divider from '@mui/material/Divider';
import { style } from 'typestyle';

import Distribution from './Distribution';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import { formatNumber } from './../../utils/format';

const strings = Strings.components.expandableRow;
const { singleRun, confidenceNote } = strings;

const numberFormatterTwoDigits = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
const formatNumberTwoDigits = (value: number) =>
  numberFormatterTwoDigits.format(value);

function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { result, id } = props;

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
    medianDifference = formatNumberTwoDigits(newMedian - baseMedian);
    medianPercentage = formatNumberTwoDigits(
      ((newMedian - baseMedian) / baseMedian) * 100,
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
      borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
      marginInlineEnd: 34 /* This value needs to be synchronized with the expand icon size. */,
    }),
    content: style({
      backgroundColor: contentThemeColor,
      padding: Spacing.Medium,
      borderRadius: Spacing.xSmall,
    }),
    bottomSpace: style({
      paddingBottom: Spacing.Small,
    }),
    note: style({
      fontSize: '10px',
      textTransform: 'uppercase',
    }),
    whiteSpace: style({
      whiteSpace: 'nowrap',
    }),
  };

  return (
    <section
      id={id}
      aria-label='Revision Row Details'
      className={`${styles.expandedRow}`}
    >
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
        <div className={`${styles.whiteSpace}`}>
          <b>Comparison result</b>: {newIsBetter ? 'better' : 'worse'} (
          {lowerIsBetter ? 'lower' : 'higher'} is better)
        </div>
        <div className={`${styles.whiteSpace}`}>
          <b>Difference of means</b>: {deltaPercent}% ({formatNumber(delta)}
          {deltaUnit ? ' ' + deltaUnit : null})
        </div>
        {newMedian && baseMedian ? (
          <div className={`${styles.whiteSpace}`}>
            <b>Difference of medians</b>: {medianPercentage}% (
            {medianDifference}
            {deltaUnit ? ' ' + deltaUnit : null})
          </div>
        ) : null}
        {confidenceText ? (
          <div>
            <div className={`${styles.whiteSpace}`}>
              <b>Confidence</b>: {confidenceText}
              {confidenceValue ? ' ' + `(${confidenceValue})` : null}
            </div>
            <div className={styles.note}>
              <b>**Note</b>: {confidenceNote}{' '}
            </div>
          </div>
        ) : (
          <div>
            <div className={`${styles.whiteSpace}`}>
              <b>Confidence</b>: Not available{' '}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface RevisionRowExpandableProps {
  result: CompareResultsItem;
  id: string;
}

export default RevisionRowExpandable;
