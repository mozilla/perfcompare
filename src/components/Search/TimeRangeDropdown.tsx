import { Box } from '@mui/system';
import { style } from 'typestyle';

import OverTimeSelect from './OverTimeSelect';
import { timeRangeMap } from '../../common/constants';
import { Strings } from '../../resources/Strings';
import { FontSize } from '../../styles';
import type { TimeRange } from '../../types/types';
import { formatDateRange } from '../../utils/format';

const strings = Strings.components.searchDefault.overTime.collapsed.timeRange;

interface TimeRangeDropdownProps {
  timeRangeValue: TimeRange['value'];
  onChange: (val: TimeRange['value']) => unknown;
}

function TimeRangeDropdown({
  timeRangeValue,
  onChange,
}: TimeRangeDropdownProps) {
  const styles = {
    // This extra flexible div is needed, so that the information looks the same in
    // both the MenuItem (in the dropdown options) and the SelectedItem (in
    // the dropdown, when the dropdown is closed).
    dateRange: style({
      display: 'flex',
      justifyContent: 'space-between',
    }),
  };

  const options = Object.entries(timeRangeMap).map(([value, text]) => ({
    value,
    label: (
      <div className={styles.dateRange}>
        {text}
        <Box sx={{ color: 'text.secondary' }} className={FontSize.Small}>
          {`(${formatDateRange(
            new Date(Date.now() - Number(value) * 1000),
            new Date(),
          )})`}
        </Box>
      </div>
    ),
  }));

  return (
    <OverTimeSelect
      value={`${timeRangeValue}`}
      name='selectedTimeRange'
      labelId='select-timerange-label'
      label={strings.selectLabel}
      testId='dropdown-select-timerange'
      className='timerange-dropdown'
      options={options}
      onChange={(value) => onChange(+value as TimeRange['value'])}
    />
  );
}

export default TimeRangeDropdown;
