import { Tooltip } from '@mui/material';

const DateTimeDisplay = ({ itemDate }: { itemDate: Date }) => {
  // Format for local time
  const localDateTime = itemDate?.toLocaleString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  });

  // Format for UTC time
  const utcDateTime = itemDate?.toLocaleString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  return (
    <Tooltip title={utcDateTime} placement='top'>
      <div>{localDateTime}</div>
    </Tooltip>
  );
};

export default DateTimeDisplay;
