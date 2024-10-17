import React from 'react';

import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface DateTimeProps {
  pushTimestamp: number;
}

const DateTime: React.FC<DateTimeProps> = ({ pushTimestamp }) => {
  const itemDate = dayjs(pushTimestamp * 1000);

  const date = itemDate.format('MMM D, YYYY');
  const localTime = itemDate.format('H:m');
  const gmtOffset = itemDate.utcOffset() / 60;
  const gmtFormatted = `GMT${gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset}`;

  const utcTime = itemDate.utc().format('MMM D, YYYY H:m [UTC]');

  return (
    <Tooltip title={`${utcTime}`}>
      <span>
        {date} {localTime} {gmtFormatted}
      </span>
    </Tooltip>
  );
};

export default DateTime;
