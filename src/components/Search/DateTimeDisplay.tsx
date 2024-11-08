import { Tooltip } from '@mui/material';

// Format for local time
const localDateFormat = new Intl.DateTimeFormat('en-US', {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  timeZoneName: 'short',
});

// Format for UTC time
const utcDateFormat = new Intl.DateTimeFormat('en-US', {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  timeZone: 'UTC',
  timeZoneName: 'short',
});

const DateTimeDisplay = ({ itemDate }: { itemDate: Date }) => {
  const localDateTime = localDateFormat.format(itemDate);
  const utcDateTime = utcDateFormat.format(itemDate);

  return (
    <Tooltip title={utcDateTime} placement='top'>
      <div>{localDateTime}</div>
    </Tooltip>
  );
};

export default DateTimeDisplay;
