import OverTimeSelect from './OverTimeSelect';
import { ALL_DATA_POINTS, dataPointsOptions } from '../../common/constants';
import { Strings } from '../../resources/Strings';
import type { DataPointsValue } from '../../types/types';

const strings = Strings.components.searchDefault.overTime.collapsed.dataPoints;

interface DataPointsDropdownProps {
  dataPointsValue: DataPointsValue;
  onChange: (val: DataPointsValue) => unknown;
}

function DataPointsDropdown({
  dataPointsValue,
  onChange,
}: DataPointsDropdownProps) {
  const options = dataPointsOptions.map(({ value, text }) => ({
    value: `${value}`,
    label: text,
  }));

  const handleDataPointsSelect = (rawValue: string) => {
    const option = dataPointsOptions.find(
      ({ value }) => `${value}` === rawValue,
    );
    onChange(option?.value ?? ALL_DATA_POINTS);
  };

  return (
    <OverTimeSelect
      value={`${dataPointsValue}`}
      // When 'all' is selected, the input isn't named, so no parameter is
      // submitted in the form URL and the server returns every data point.
      name={
        dataPointsValue === ALL_DATA_POINTS ? undefined : 'numberOfDataPoints'
      }
      labelId='select-datapoints-label'
      label={strings.selectLabel}
      testId='dropdown-select-datapoints'
      className='datapoints-dropdown'
      options={options}
      onChange={handleDataPointsSelect}
    />
  );
}

export default DataPointsDropdown;
